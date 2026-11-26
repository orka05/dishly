import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthSession } from '../../core/services/auth-session';

interface Entry {
  code: string;
  name: string;
}

@Component({
  selector: 'app-admin-catalogs',
  imports: [FormsModule],
  templateUrl: './admin-catalogs.html',
  styleUrl: './admin-catalogs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCatalogs {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  protected readonly session = inject(AuthSession);
  private readonly options = { headers: { 'X-Requested-With': 'XMLHttpRequest' } };
  private readonly entries = signal<Entry[]>([]);
  private readonly counts = signal<Record<string, number>>({});
  private readonly collator = new Intl.Collator('sr-Latn', { sensitivity: 'base' });

  protected readonly groups = [
    {
      label: 'Recipe types',
      description: 'Meal, dish, and diet types',
      catalog: 'meal-types',
      add: 'Add recipe type',
      search: 'Search recipe types by name…',
    },
    {
      label: 'Ingredient categories',
      description: 'Organize ingredients',
      catalog: 'ingredient-categories',
      add: 'Add category',
      search: 'Search categories by name…',
    },
    {
      label: 'Allergens',
      description: 'Labels for safer food choices',
      catalog: 'allergens',
      add: 'Add allergen',
      search: 'Search allergens by name…',
    },
  ];
  protected readonly recipeTypes = [
    { label: 'Meal type', catalog: 'meal-types' },
    { label: 'Dish type', catalog: 'dish-types' },
    { label: 'Diet type', catalog: 'diet-types' },
  ];
  protected readonly group = signal(2);
  protected readonly catalog = signal('allergens');
  protected readonly activeGroup = computed(() => this.groups[this.group()]);
  protected readonly groupCounts = computed(() => {
    const counts = this.counts();
    const recipeCounts = this.recipeTypes.map(({ catalog }) => counts[catalog]);
    return [
      recipeCounts.every((count) => count !== undefined)
        ? recipeCounts.reduce((sum, count) => sum + count, 0)
        : undefined,
      counts['ingredient-categories'],
      counts['allergens'],
    ];
  });
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly dialogError = signal('');
  protected readonly search = signal('');
  protected readonly ascending = signal(true);
  protected readonly page = signal(1);
  protected readonly pageSizes = [8, 16, 24];
  protected readonly pageSize = signal(this.pageSizes[0]);
  protected readonly matching = computed(() => {
    const term = this.search().trim().toLocaleLowerCase('sr-Latn');
    return this.entries()
      .filter(({ name }) => name.toLocaleLowerCase('sr-Latn').includes(term))
      .sort((a, b) => this.collator.compare(a.name, b.name) * (this.ascending() ? 1 : -1));
  });
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.matching().length / this.pageSize())),
  );
  protected readonly pageStart = computed(() => (this.page() - 1) * this.pageSize());
  protected readonly visible = computed(() => {
    const offset = this.pageStart();
    return this.matching().slice(offset, offset + this.pageSize());
  });
  protected readonly pages = computed(() => {
    const start = Math.max(1, Math.min(this.page() - 2, this.pageCount() - 4));
    return Array.from({ length: Math.min(5, this.pageCount()) }, (_, index) => start + index);
  });

  protected name = '';
  protected selected: Entry | null = null;
  protected deleting = false;

  async ngOnInit(): Promise<void> {
    await this.request(async () => {
      await this.load();
      const otherCatalogs = [...this.recipeTypes, ...this.groups.slice(1)].filter(
        ({ catalog }) => catalog !== this.catalog(),
      );
      await Promise.allSettled(
        otherCatalogs.map(async ({ catalog }) => {
          const entries = await this.fetchEntries(catalog);
          this.setCount(catalog, entries.length);
        }),
      );
    });
  }

  protected signOut(): void {
    this.session.end();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  protected async selectCatalog(group: number, catalog: string): Promise<void> {
    if (this.busy()) return;
    this.group.set(group);
    this.catalog.set(catalog);
    this.search.set('');
    this.ascending.set(true);
    this.page.set(1);
    this.entries.set([]);
    await this.request(() => this.load());
  }

  protected searchFor(term: string): void {
    this.search.set(term);
    this.page.set(1);
  }

  protected sort(): void {
    this.ascending.update((value) => !value);
    this.page.set(1);
  }

  protected resizePage(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  protected open(dialog: HTMLDialogElement, entry: Entry | null, deleting = false): void {
    this.selected = entry;
    this.name = entry?.name ?? '';
    this.deleting = deleting;
    this.dialogError.set('');
    dialog.showModal();
  }

  protected async save(dialog: HTMLDialogElement): Promise<void> {
    const entry = this.selected;
    const url = entry ? `${this.url}/${encodeURIComponent(entry.code)}` : this.url;
    const deleting = this.deleting;
    const name = this.name.trim();

    await this.request(async () => {
      if (deleting && entry) {
        await firstValueFrom(this.http.delete(url, this.options));
        this.entries.update((entries) => entries.filter(({ code }) => code !== entry.code));
      } else {
        const saved = await firstValueFrom(
          entry
            ? this.http.put<Entry>(url, { name }, this.options)
            : this.http.post<Entry>(url, { name }, this.options),
        );
        this.entries.update((entries) => [
          ...entries.filter(({ code }) => code !== saved.code),
          saved,
        ]);
        if (!entry) this.search.set('');
      }
      this.setCount(this.catalog(), this.entries().length);
      this.page.set(Math.min(this.page(), this.pageCount()));
      dialog.close();
    }, dialog);
  }

  private get url(): string {
    return `/api/admin/catalogs/${this.catalog()}`;
  }

  private async load(): Promise<void> {
    const catalog = this.catalog();
    const entries = await this.fetchEntries(catalog);
    this.entries.set(entries);
    this.setCount(catalog, entries.length);
  }

  private fetchEntries(catalog: string): Promise<Entry[]> {
    return firstValueFrom(this.http.get<Entry[]>(`/api/admin/catalogs/${catalog}`, this.options));
  }

  private setCount(catalog: string, count: number): void {
    this.counts.update((counts) => ({ ...counts, [catalog]: count }));
  }

  private async request(action: () => Promise<void>, dialog?: HTMLDialogElement): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.dialogError.set('');

    try {
      await action();
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      if (status === 401 || status === 403) {
        (dialog ? this.dialogError : this.error).set('Administrator access is required.');
      } else {
        const message =
          status === 409
            ? this.deleting
              ? 'This item is in use and cannot be deleted.'
              : 'An item with this name already exists.'
            : status === 404 && dialog
              ? 'This item is no longer available. Refresh the list and try again.'
              : 'The request failed. Try again.';
        (dialog ? this.dialogError : this.error).set(message);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
