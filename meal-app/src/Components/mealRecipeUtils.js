import { RECIPES_BY_MEAL } from "./AllRecipe";

export function getMealRecipe(meal = {}, category = "") {
  const recipes = RECIPES_BY_MEAL[category] || [];
  const fallback = recipes.find(recipe =>
    recipe.name.toLowerCase() === String(meal.name || "").toLowerCase()
  ) || recipes[0] || {};

  return {
    ...fallback,
    ...meal,
    ingredients: meal.customIngredients || meal.ingredients || fallback.ingredients || [],
    steps: meal.customSteps || meal.steps || meal.process || fallback.steps || [],
    calories: meal.calories ?? fallback.calories ?? 0,
    estimatedPrice: meal.price ?? meal.estimatedPrice ?? fallback.estimatedPrice ?? 0,
    image: meal.image || fallback.image || ""
  };
}
