import React, { useState } from "react";
import {
  readFavoriteMeals,
  removeFavoriteMeal
} from "./favoriteMealsStorage";
import "./style.css";

const navItems = [
  { name: "Home", icon: "⌂" },
  { name: "Meal Planner", icon: "▦" },
  { name: "Generated Meal Plans", icon: "◷" },
  { name: "Shopping List", icon: "🛒" },
  { name: "Meal Suggestion", icon: "✧" },
  { name: "Favorites", icon: "♡" },
  { name: "Meal History", icon: "◴" }
];

function Favorites({ onNavigate }) {
  const [favorites, setFavorites] = useState(readFavoriteMeals);

  const handleNavigation = page => {
    if (onNavigate) onNavigate(page);
  };

  const handleRemove = mealId => {
    setFavorites(removeFavoriteMeal(mealId));
  };

  return (
    <div className="meal-layout planner-layout">
      <aside className="meal-sidebar">
        <div className="meal-logo">
          <span className="logo-icon">✿</span>
          <h2>Meal<span>Mind</span></h2>
        </div>
        <p className="sidebar-label">MENU</p>
        <nav aria-label="Main navigation" className="sidebar-links">
          {navItems.map(item => (
            <button
              aria-current={item.name === "Favorites" ? "page" : undefined}
              className={`sidebar-btn${item.name === "Favorites" ? " selected" : ""}`}
              key={item.name}
              onClick={() => handleNavigation(item.name)}
              type="button"
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
        <button
          className="logout-btn"
          onClick={() => handleNavigation("Logout")}
          type="button"
        >
          ↪ Logout
        </button>
      </aside>

      <main className="favorites-page">
        <header className="favorites-header">
          <p>YOUR PERSONAL COLLECTION</p>
          <h1>Favorite Meals</h1>
          <span>Meals you saved from generated plans and suggestions.</span>
        </header>

        {favorites.length === 0 ? (
          <section className="favorites-empty">
            <span aria-hidden="true">♡</span>
            <h2>No favorite meals yet</h2>
            <p>Tap the heart on a generated meal or suggestion to save it here.</p>
          </section>
        ) : (
          <section aria-label="Favorite meals" className="favorites-grid">
            {favorites.map(meal => (
              <article className="favorites-card" key={meal.id}>
                {meal.image && (
                  <img alt={meal.name} loading="lazy" src={meal.image} />
                )}
                <div className="favorites-card-content">
                  <span>{meal.category || meal.type || "Meal"}</span>
                  <h2>{meal.name}</h2>
                  <p>
                    {meal.calories ? `${meal.calories} kcal` : ""}
                    {meal.calories && meal.price ? " · " : ""}
                    {meal.price ? `₱${meal.price}` : ""}
                  </p>
                  {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
                    <details>
                      <summary>View recipe</summary>
                      <strong>Ingredients</strong>
                      <ul>
                        {meal.ingredients.map((ingredient, index) => (
                          <li key={`${ingredient}-${index}`}>{ingredient}</li>
                        ))}
                      </ul>
                      <strong>Instructions</strong>
                      <ol>
                        {(meal.steps || []).map((step, index) => (
                          <li key={`${index}-${step}`}>{step}</li>
                        ))}
                      </ol>
                    </details>
                  )}
                  <button
                    aria-label={`Remove ${meal.name} from favorites`}
                    className="favorites-remove"
                    onClick={() => handleRemove(meal.id)}
                    type="button"
                  >
                    Remove favorite
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default Favorites;
