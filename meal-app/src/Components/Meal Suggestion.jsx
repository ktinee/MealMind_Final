import React, { useMemo, useState } from "react";
import { RECIPES_BY_MEAL } from "./AllRecipe";
import {
  readFavoriteMeals,
  removeFavoriteMeal,
  saveFavoriteMeal
} from "./favoriteMealsStorage";
import { getMealRecipe } from "./mealRecipeUtils";
import { readCurrentMealPlan } from "./mealPlanStorage";
import "./mealSuggestion.css";

const navItems = [
  { name: "Home", icon: "⌂" },
  { name: "Meal Planner", icon: "▦" },
  { name: "Generated Meal Plans", icon: "◷" },
  { name: "Shopping List", icon: "🛒" },
  { name: "Meal Suggestion", icon: "✧" },
  { name: "Favorites", icon: "♡" },
  { name: "Meal History", icon: "◴" }
];

const mealTypes = ["Breakfast", "Lunch", "Snack", "Dinner"];

const suggestions = mealTypes.flatMap(category =>
  (RECIPES_BY_MEAL[category] || []).map(recipe => ({
    ...recipe,
    category
  }))
);

function readAvailableIngredients() {
  try {
    const planner = readCurrentMealPlan();
    const ingredients = new Set(
      typeof planner?.groceries === "string"
        ? planner.groceries
            .split(",")
            .map(item => item.trim().toLowerCase())
            .filter(Boolean)
        : []
    );

    Object.values(planner?.mealPlan || {}).forEach(day => {
      Object.values(day || {}).forEach(meal => {
        (Array.isArray(meal?.groceries) ? meal.groceries : []).forEach(item => {
          if (typeof item === "string" && item.trim()) {
            ingredients.add(item.trim().toLowerCase());
          }
        });
      });
    });

    return ingredients;
  } catch {
    return new Set();
  }
}

function MealSuggestion({ onNavigate }) {
  const [activePage, setActivePage] = useState("Meal Suggestion");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openRecipe, setOpenRecipe] = useState(null);
  const [favorites, setFavorites] = useState(readFavoriteMeals);
  const availableIngredients = useMemo(readAvailableIngredients, []);
  const categories = ["All", ...mealTypes];
  const filteredSuggestions = suggestions
    .filter(meal => activeCategory === "All" || meal.category === activeCategory)
    .map(meal => {
      const availableCount = [...availableIngredients].filter(available =>
        meal.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(available)
        )
      ).length;
      return { ...meal, availableCount };
    })
    .sort((first, second) => second.availableCount - first.availableCount);

  const handleNavigation = page => {
    setActivePage(page);
    if (onNavigate) onNavigate(page);
  };

  const handleFavorite = (meal, recipe) => {
    const savedMeal = {
      name: meal.name,
      category: meal.category,
      image: meal.image,
      calories: recipe.calories,
      price: recipe.estimatedPrice,
      ingredients: recipe.ingredients,
      steps: recipe.steps
    };
    const existing = favorites.find(favorite =>
      favorite.name === meal.name && favorite.category === meal.category
    );
    if (existing) {
      setFavorites(removeFavoriteMeal(existing.id));
    } else {
      setFavorites(saveFavoriteMeal(savedMeal));
    }
  };

  const isFavorite = meal =>
    favorites.some(favorite =>
      favorite.name === meal.name && favorite.category === meal.category
    );

  return (
    <div className="meal-layout planner-layout">
      <aside className="meal-sidebar">
        <div className="meal-logo">
          <span className="logo-icon">✿</span>
          <h2>Meal<span>Mind</span></h2>
        </div>
        <p className="sidebar-label">MENU</p>
        <div className="sidebar-links">
          {navItems.map(item => (
            <button
              className={`sidebar-btn${activePage === item.name ? " selected" : ""}`}
              key={item.name}
              onClick={() => handleNavigation(item.name)}
              type="button"
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>
        <button
          className="logout-btn"
          onClick={() => handleNavigation("Logout")}
          type="button"
        >
          ↪ Logout
        </button>
      </aside>

    <main className="suggestion-page">
      <header className="suggestion-header">
        <div>
          <p className="suggestion-eyebrow">PERSONALIZED IDEAS</p>
          <h1>Meal Suggestions</h1>
          <p>
            {availableIngredients.size
              ? "Meals using ingredients you already have are shown first."
              : "Explore meal ideas and find something delicious to make."}
          </p>
        </div>
      </header>

      <nav aria-label="Filter meal suggestions" className="suggestion-filters">
        {categories.map(category => (
          <button
            aria-pressed={activeCategory === category}
            className={activeCategory === category ? "is-active" : ""}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </nav>

      <section aria-label="Suggested meals" className="suggestion-grid">
        {filteredSuggestions.map(meal => {
          const recipe = getMealRecipe(meal, meal.category);
          const isOpen = openRecipe === meal.name;

          return (
            <article className="suggestion-card" key={`${meal.category}-${meal.name}`}>
              <img alt={meal.name} loading="lazy" src={meal.image} />
              <button
                aria-label={`${isFavorite(meal) ? "Remove" : "Add"} ${meal.name} ${isFavorite(meal) ? "from" : "to"} favorites`}
                aria-pressed={isFavorite(meal)}
                className={`suggestion-favorite-button${isFavorite(meal) ? " is-favorite" : ""}`}
                onClick={() => handleFavorite(meal, recipe)}
                title={isFavorite(meal) ? "Remove from favorites" : "Add to favorites"}
                type="button"
              >
                {isFavorite(meal) ? "♥" : "♡"}
              </button>
              <div className="suggestion-card-content">
                <span className="suggestion-category">{meal.category}</span>
                <h2>{meal.name}</h2>
                <p className="suggestion-calories">
                   {meal.calories} kcal · Cost: ₱{meal.price}
                </p>
                {availableIngredients.size > 0 && (
                  <p className="suggestion-match">
                    🥬 You have {meal.availableCount} of {meal.ingredients.length} ingredients
                  </p>
                )}
                <button
                  aria-expanded={isOpen}
                  className="suggestion-recipe-button"
                  onClick={() =>
                    setOpenRecipe(current => current === meal.name ? null : meal.name)
                  }
                  type="button"
                >
                  {isOpen ? "Hide Recipe" : "View Recipe"}
                </button>
                {isOpen && (
                  <div className="suggestion-recipe">
                    <strong>Ingredients</strong>
                    <ul>
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={`${ingredient}-${index}`}>{ingredient}</li>
                      ))}
                    </ul>
                    <strong>Instructions</strong>
                    <ol>
                      {recipe.steps.map((step, index) => (
                        <li key={`${index}-${step}`}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
    </div>
  );
}

export default MealSuggestion;
