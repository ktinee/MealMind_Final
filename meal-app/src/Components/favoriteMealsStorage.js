function getFavoritesKey() {
  try {
    const session = JSON.parse(window.localStorage.getItem("mealmind_session") || "null");
    return `mealMindFavoriteMeals:${session?.userId || session?.username || "guest"}`;
  } catch {
    return "mealMindFavoriteMeals:guest";
  }
}

export function readFavoriteMeals() {
  try {
    const meals = JSON.parse(window.localStorage.getItem(getFavoritesKey()) || "[]");
    return Array.isArray(meals) ? meals : [];
  } catch {
    return [];
  }
}

export function saveFavoriteMeal(meal) {
  const meals = readFavoriteMeals();
  const id = meal.id || `${meal.category || "Meal"}:${meal.name.toLowerCase()}`;
  const saved = { ...meal, id };
  const next = [saved, ...meals.filter(item => item.id !== id)];
  window.localStorage.setItem(getFavoritesKey(), JSON.stringify(next));
  return next;
}

export function removeFavoriteMeal(id) {
  const next = readFavoriteMeals().filter(meal => meal.id !== id);
  window.localStorage.setItem(getFavoritesKey(), JSON.stringify(next));
  return next;
}
