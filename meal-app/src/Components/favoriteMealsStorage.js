import { getMealMindStorageKey } from "./mealPlanStorage";

const FAVORITES_KEY = "mealMindFavoriteMeals";

export function readFavoriteMeals() {
  try {
    const saved = localStorage.getItem(getMealMindStorageKey(FAVORITES_KEY));
    const favorites = saved ? JSON.parse(saved) : [];
    return Array.isArray(favorites)
      ? favorites.filter(meal => meal && typeof meal.name === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveFavoriteMeal(meal) {
  const favorites = readFavoriteMeals();
  const mealId = `${meal.category || meal.type || ""}:${meal.name}`
    .toLowerCase();
  const updatedFavorites = [
    { ...meal, id: mealId },
    ...favorites.filter(favorite => favorite.id !== mealId)
  ];

  localStorage.setItem(
    getMealMindStorageKey(FAVORITES_KEY),
    JSON.stringify(updatedFavorites)
  );
  return updatedFavorites;
}

export function removeFavoriteMeal(mealId) {
  const updatedFavorites = readFavoriteMeals().filter(
    meal => meal.id !== mealId
  );
  localStorage.setItem(
    getMealMindStorageKey(FAVORITES_KEY),
    JSON.stringify(updatedFavorites)
  );
  return updatedFavorites;
}
