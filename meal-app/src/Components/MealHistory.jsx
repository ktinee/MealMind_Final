import React, { useEffect, useState } from "react";
import {
  archiveCurrentMealPlan,
  readMealPlanHistory
} from "./mealPlanStorage";
import { loadMealPlans } from "./mealPlanApi";
import { getMealRecipe } from "./mealRecipeUtils";
import { toDateInputValue } from "./mealPlanUtils";
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

const mealTypes = ["Breakfast", "Lunch", "Snack", "Dinner"];
const mealTypeImages = {
  Breakfast:
    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600",
  Lunch:
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600",
  Snack:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
  Dinner:
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600"
};

function formatPlanDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? dateKey
    : date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      });
}

function MealHistory({ onNavigate }) {
  const [pastDays, setPastDays] = useState([]);
  const [activePage, setActivePage] = useState("Meal History");

  useEffect(() => {
    archiveCurrentMealPlan();
    let active = true;
    const updatePastDays = plans => {
      const today = toDateInputValue(new Date());
      const entries = plans.flatMap(plan =>
        Object.entries(plan.mealPlan || {})
          .filter(([dateKey, day]) =>
            dateKey < today &&
            day &&
            typeof day === "object" &&
            !Array.isArray(day)
          )
          .map(([dateKey, day]) => ({
            id: `${plan.id}-${dateKey}`,
            dateKey,
            planType: plan.planType || "Meal",
            meals: mealTypes.flatMap(type => {
              const meal = day[type];
              return meal?.name ? [{ type, ...meal }] : [];
            })
          }))
          .filter(day => day.meals.length > 0)
      );
      setPastDays(entries.sort((first, second) =>
        second.dateKey.localeCompare(first.dateKey)
      ));
    };

    loadMealPlans()
      .then(plans => {
        if (active) updatePastDays(plans);
      })
      .catch(error => {
        if (active) {
          window.alert(error.message);
          updatePastDays(readMealPlanHistory());
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleNavigation = page => {
    setActivePage(page);
    if (onNavigate) onNavigate(page);
  };

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

    <main className="past-meal-history-page">
      <header className="past-meal-history-header">
        <div>
          <p className="past-meal-history-eyebrow">YOUR MEALMIND COLLECTION</p>
          <h1>Meal History</h1>
          <p>Generated meals automatically appear here after their scheduled date.</p>
        </div>
        <div className="past-meal-history-actions">
          <button
            className="past-meal-history-primary"
            onClick={() => handleNavigation("Meal Planner")}
            type="button"
          >
            + Create a plan
          </button>
        </div>
      </header>

      {pastDays.length === 0 ? (
        <section className="past-meal-history-empty">
          <span aria-hidden="true">◴</span>
          <h2>No past meals yet</h2>
          <p>Generated meals will move here automatically after their scheduled date.</p>
        </section>
      ) : (
        <section aria-label="Past generated meals" className="past-meal-history-list">
          {pastDays.map(day => (
            <article className="past-meal-history-card" key={day.id}>
              <header className="past-meal-history-card-header">
                <div>
                  <span className="past-meal-history-badge">
                    {day.planType} plan
                  </span>
                  <h2>{formatPlanDate(day.dateKey)}</h2>
                </div>
                <span className="past-meal-history-count">
                  {day.meals.length} {day.meals.length === 1 ? "meal" : "meals"}
                </span>
              </header>
              <div className="past-meal-history-meals">
                {day.meals.map(meal => {
                  const recipe = getMealRecipe(meal, meal.type);
                  return (
                    <article
                      className="past-meal-history-meal"
                      key={`${day.id}-${meal.type}`}
                    >
                      <img
                        alt={meal.name}
                        loading="lazy"
                        src={meal.image || mealTypeImages[meal.type]}
                      />
                      <span>{meal.type}</span>
                      <strong>{meal.name}</strong>
                      {(meal.calories ?? recipe.calories)
                        ? <small>{meal.calories ?? recipe.calories} kcal</small>
                        : null}
                      <details>
                        <summary>View recipe</summary>
                        <h3>{recipe.name}</h3>
                        <p>Ingredients</p>
                        <ul>
                          {recipe.ingredients.map((ingredient, index) => (
                            <li key={`${ingredient}-${index}`}>{ingredient}</li>
                          ))}
                        </ul>
                        <p>Instructions</p>
                        <ol>
                          {recipe.steps.map((step, index) => (
                            <li key={`${index}-${step}`}>{step}</li>
                          ))}
                        </ol>
                      </details>
                    </article>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
    </div>
  );
}

export default MealHistory;
