export interface Meal {
  readonly image: string;
  readonly title: string;
  readonly rating: string;
  readonly minutes: number;
  readonly hasRankedPhoto?: boolean;
}

interface MealSection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly meals: readonly Meal[];
  readonly ingredients?: readonly string[];
}

const lemonChicken = { image: 'lemon-chicken-orzo', title: 'Lemon Chicken & Orzo', rating: '4.9', minutes: 30, hasRankedPhoto: true };
const pumpkinSoup = { image: 'roasted-pumpkin-soup', title: 'Roasted Pumpkin Soup', rating: '4.8', minutes: 35, hasRankedPhoto: true };
const grainBowl = { image: 'mediterranean-grain-bowl', title: 'Mediterranean Grain Bowl', rating: '4.8', minutes: 25, hasRankedPhoto: true };
const tomatoPasta = { image: 'creamy-tomato-pasta', title: 'Creamy Tomato Pasta', rating: '4.7', minutes: 20 };
const salmonBowl = { image: 'salmon-avocado-bowl', title: 'Salmon & Avocado Bowl', rating: '4.7', minutes: 25 };
const shrimpTacos = { image: 'chipotle-shrimp-tacos', title: 'Chipotle Shrimp Tacos', rating: '4.6', minutes: 25 };
const lasagna = { image: 'spinach-ricotta-lasagna', title: 'Spinach & Ricotta Lasagna', rating: '4.6', minutes: 55 };
const granola = { image: 'berry-yogurt-granola', title: 'Berry & Yogurt Granola', rating: '4.5', minutes: 10 };

export const mealSections: readonly MealSection[] = [
  {
    id: 'popular',
    title: 'Popular',
    description: 'Top-rated in the past month',
    meals: [lemonChicken, pumpkinSoup, grainBowl, tomatoPasta, salmonBowl, shrimpTacos, lasagna, granola],
  },
  {
    id: 'recent',
    title: 'Newest',
    description: 'Recently added recipes',
    meals: [shrimpTacos, salmonBowl, granola, lasagna, tomatoPasta, grainBowl, pumpkinSoup, lemonChicken],
  },
  {
    id: 'ingredients',
    title: 'From my ingredients',
    description: 'Recipes you can make with your ingredients',
    ingredients: ['Orzo', 'Tomatoes', 'Feta'],
    meals: [lemonChicken, tomatoPasta, shrimpTacos, lasagna],
  },
];
