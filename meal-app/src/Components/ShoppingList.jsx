import React, { useEffect, useMemo, useState } from "react";
import { getMealRecipe } from "./mealRecipeUtils";
import { toDateInputValue } from "./mealPlanUtils";
import {
  getMealMindStorageKey,
  deleteMealPlanSnapshot,
  readMealPlanHistory
} from "./mealPlanStorage";
import { deleteMealPlan as deleteMealPlanFromApi, loadMealPlans } from "./mealPlanApi";
import "./shoppingList.css";

const SHOPPING_CHECKED_KEY = getMealMindStorageKey("mealMindShoppingChecked");
const MEAL_TYPES = ["Breakfast", "Lunch", "Snack", "Dinner"];
const navItems = [
  { name: "Home", icon: "⌂" },
  { name: "Meal Planner", icon: "▦" },
  { name: "Generated Meal Plans", icon: "◷" },
  { name: "Shopping List", icon: "🛒" },
  { name: "Meal Suggestion", icon: "✧" },
  { name: "Favorites", icon: "♡" },
  { name: "Meal History", icon: "◴" }
];

function readSavedPlans() {
  const savedPlans = readMealPlanHistory();
  try {
    const saved = localStorage.getItem(getMealMindStorageKey("mealMindPlanner"));
    const planner = saved ? JSON.parse(saved) : null;
    const currentPlanId = planner?.planId || "legacy-current-plan";
    if (
      planner?.mealPlan &&
      typeof planner.mealPlan === "object" &&
      !Array.isArray(planner.mealPlan) &&
      !savedPlans.some(plan => plan.id === currentPlanId)
    ) {
      savedPlans.push({ ...planner, id: currentPlanId });
    }
  } catch {
    return savedPlans;
  }
  return savedPlans;
}

function readCheckedItems() {
  try {
    const saved = localStorage.getItem(SHOPPING_CHECKED_KEY);
    const checkedItems = saved ? JSON.parse(saved) : [];
    return Array.isArray(checkedItems) ? checkedItems : [];
  } catch {
    return [];
  }
}

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

function ShoppingList({ onNavigate }) {
  const [mealPlans, setMealPlans] = useState(readSavedPlans);
  const [checkedItems, setCheckedItems] = useState(readCheckedItems);
  const [range, setRange] = useState("all");
  const [activePage, setActivePage] = useState("Shopping List");
  const todayKey = toDateInputValue(new Date());

  useEffect(() => {
    let active = true;
    loadMealPlans()
      .then(plans => {
        if (active) setMealPlans(plans);
      })
      .catch(error => {
        if (active) window.alert(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const shoppingItems = useMemo(() => {
    return mealPlans.map(plan => ({
      id: plan.id,
      planType: plan.planType || "Meal",
      savedAt: plan.savedAt,
      days: Object.entries(plan.mealPlan || {})
        .filter(([dateKey, day]) =>
          (range !== "today" || dateKey === todayKey) &&
          day && typeof day === "object" && !Array.isArray(day)
        )
        .map(([dateKey, day]) => ({
          dateKey,
          meals: MEAL_TYPES.flatMap(type => {
            const meal = day[type];
            if (!meal?.name) return [];

            const mealId = `${plan.id}-${dateKey}-${type}`;
            const recipeIngredients = getMealRecipe(meal, type).ingredients;
            const ingredients = Array.isArray(meal.customIngredients)
              ? meal.customIngredients
              : Array.isArray(meal.ingredients)
                ? meal.ingredients
                : recipeIngredients;
            return [{
              id: mealId,
              type,
              name: meal.name,
              ingredients: [...new Map(
                ingredients
                  .map(ingredient => ingredient.trim())
                  .filter(Boolean)
                  .map(ingredient => [ingredient.toLowerCase(), ingredient])
              ).values()].map(ingredient => ({
                id: `${mealId}-${ingredient.toLowerCase()}`,
                name: ingredient
              }))
            }];
          })
        }))
        .filter(day => day.meals.length > 0)
        .sort((first, second) => second.dateKey.localeCompare(first.dateKey))
    }))
      .filter(plan => plan.days.length > 0)
      .sort((first, second) =>
        Date.parse(second.savedAt || "") - Date.parse(first.savedAt || "") ||
        second.days[0].dateKey.localeCompare(first.days[0].dateKey)
      );
  }, [mealPlans, range, todayKey]);

  useEffect(() => {
    localStorage.setItem(SHOPPING_CHECKED_KEY, JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleItem = id => {
    setCheckedItems(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  };

  const deletePlan = async plan => {
    if (!window.confirm(`Delete this ${plan.planType.toLowerCase()} meal plan and its shopping list? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteMealPlanFromApi(plan.id);
      deleteMealPlanSnapshot(plan.id);
      setMealPlans(currentPlans => currentPlans.filter(item => item.id !== plan.id));
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleNavigation = page => {
    setActivePage(page);
    if (onNavigate) onNavigate(page);
  };

  const allIngredients = shoppingItems.flatMap(plan =>
    plan.days.flatMap(day => day.meals.flatMap(meal => meal.ingredients))
  );
  const completedCount = allIngredients.filter(item =>
    checkedItems.includes(item.id)
  ).length;

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

    <main className="shopping-list-page">
      <header className="shopping-list-header">
        <div>
          <p className="shopping-list-eyebrow">MEALMIND ORGANIZER</p>
          <h1>Shopping List</h1>
          <p>Ingredients from your generated meal plan, gathered in one place.</p>
        </div>
        <div className="shopping-list-actions">
          <button
            className="shopping-list-primary"
            onClick={() => handleNavigation("Meal Planner")}
            type="button"
          >
            Open Meal Planner
          </button>
        </div>
      </header>

      <section className="shopping-list-panel">
        <div className="shopping-list-toolbar">
          <label htmlFor="shoppingListRange">Show ingredients for</label>
          <select
            id="shoppingListRange"
            onChange={event => setRange(event.target.value)}
            value={range}
          >
            <option value="all">All planned meals</option>
            <option value="today">Today's meals</option>
          </select>
          <span className="shopping-list-progress">
            {completedCount} of {allIngredients.length} checked
          </span>
        </div>

        {shoppingItems.length === 0 ? (
          <div className="shopping-list-empty">
            <span aria-hidden="true">🛒</span>
            <h2>No ingredients to show yet</h2>
            <p>Generate a meal plan to build your shopping list.</p>
            <button
              className="shopping-list-primary"
              onClick={() => handleNavigation("Meal Planner")}
              type="button"
            >
              Create a meal plan
            </button>
          </div>
        ) : (
          <div className="shopping-list-plans">
            {shoppingItems.map(plan => (
              <article className="shopping-list-plan" key={plan.id}>
                <header className="shopping-list-plan-header">
                  <div>
                    <h2>{plan.planType} Meal Plan</h2>
                    <p className="shopping-list-plan-type">
                      {plan.days.length} {plan.days.length === 1 ? "planned day" : "planned days"}
                    </p>
                  </div>
                  <button
                    aria-label={`Delete ${plan.planType.toLowerCase()} meal plan`}
                    className="shopping-list-delete-plan"
                    onClick={() => deletePlan(plan)}
                    type="button"
                  >
                    Delete plan
                  </button>
                </header>
                <div className="shopping-list-days">
                  {plan.days.map(day => (
                    <section className="shopping-list-day" key={day.dateKey}>
                      <h3>{formatPlanDate(day.dateKey)}</h3>
                      <div className="shopping-list-meal-grid">
                        {day.meals.map(meal => (
                          <article className="shopping-list-meal-card" key={meal.id}>
                            <h4>{meal.type}</h4>
                            <p className="shopping-list-meal-name">{meal.name}</p>
                            <p className="shopping-list-ingredients-label">
                              Ingredients
                            </p>
                            <ul className="shopping-list-items">
                              {meal.ingredients.map(item => {
                                const isChecked = checkedItems.includes(item.id);
                                return (
                                  <li
                                    className={isChecked
                                      ? "shopping-list-item is-checked"
                                      : "shopping-list-item"}
                                    key={item.id}
                                  >
                                    <label>
                                      <input
                                        checked={isChecked}
                                        onChange={() => toggleItem(item.id)}
                                        type="checkbox"
                                      />
                                      <span className="shopping-list-item-name">
                                        {item.name}
                                      </span>
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
    </div>
  );
}

export default ShoppingList;
