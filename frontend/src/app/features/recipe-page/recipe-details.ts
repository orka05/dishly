interface RecipeDetails {
  readonly photo: string;
  readonly mobilePhoto: string;
  readonly servings: number;
  readonly ratingCount: number;
  readonly description: string;
  readonly ingredients: readonly string[];
  readonly steps: readonly { title: string; description: string }[];
}

export const recipeDetails: Readonly<Partial<Record<string, RecipeDetails>>> = {
  'lemon-chicken-orzo': {
    photo: 'dishly/recipe/lemon-chicken-desktop.png',
    mobilePhoto: 'dishly/recipe/lemon-chicken-mobile.png',
    servings: 2,
    ratingCount: 128,
    description: 'Golden chicken and tender orzo in a bright lemon sauce, finished with spinach and Parmesan.',
    ingredients: [
      'Boneless chicken breast', 'Orzo', 'Chicken stock', 'Lemon',
      'Garlic', 'Olive oil', 'Parmesan', 'Baby spinach',
    ],
    steps: [
      {
        title: 'Sear the chicken',
        description: 'Season the chicken, then sear in olive oil until golden. Transfer it to a plate.',
      },
      {
        title: 'Simmer the orzo',
        description: 'Add garlic and orzo to the pan. Stir in the stock and lemon zest, then simmer until the orzo is tender.',
      },
      {
        title: 'Finish and serve',
        description: 'Return the chicken to the pan to finish cooking. Stir in the spinach, Parmesan and lemon juice before serving.',
      },
    ],
  },
};
