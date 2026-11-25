export interface Meal {
  readonly image: string;
  readonly title: string;
}

interface MealSection {
  readonly id: string;
  readonly title: string;
  readonly meals: readonly Meal[];
}

const dishes = {
  choppedSalad: { image: 'sprouts', title: 'Chopped Vegetable Salad with Fresh Herbs' },
  eggBowl: { image: 'cauliflower', title: 'Grain Bowl with Eggs, Greens & Roasted Vegetables' },
  fritters: { image: 'zucchini', title: 'Vegetable Fritters with Greens & Dipping Sauce' },
  soup: { image: 'butter-chicken', title: 'Creamy Vegetable Soup with Herbs' },
  grainBowl: { image: 'pasta', title: 'Grain Bowl with Asparagus & Roasted Tomatoes' },
  greenSalad: { image: 'greek-salad', title: 'Mixed Greens Salad with Avocado & Herbs' },
  beanSoup: { image: 'make-now-3', title: 'Creamy Bean Soup with Herbs & Seeds' },
  roastedSalad: { image: 'make-now-1', title: 'Roasted Vegetable Salad with Greens & Crumbled Cheese' },
  greekSalad: { image: 'make-now-2', title: 'Greek Salad with Feta Cheese & Kalamata Olives' },
} satisfies Record<string, Meal>;

export const mealSections: readonly MealSection[] = [
  {
    id: 'popular',
    title: 'Most Popular Dishly’s',
    meals: [
      dishes.choppedSalad,
      dishes.eggBowl,
      dishes.fritters,
      dishes.soup,
      dishes.grainBowl,
      dishes.fritters,
      dishes.choppedSalad,
      dishes.greenSalad,
      dishes.roastedSalad,
      dishes.greekSalad,
    ],
  },
  {
    id: 'make-now',
    title: 'Make Now',
    meals: [dishes.soup, dishes.greenSalad, dishes.beanSoup],
  },
  {
    id: 'recent',
    title: 'Recently Created',
    meals: [
      dishes.roastedSalad,
      dishes.greekSalad,
      dishes.grainBowl,
      dishes.soup,
      dishes.fritters,
      dishes.eggBowl,
      dishes.beanSoup,
      dishes.grainBowl,
    ],
  },
];
