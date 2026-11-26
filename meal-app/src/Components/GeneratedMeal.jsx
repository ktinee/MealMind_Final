import React, { useEffect, useState } from "react";
import { archiveCurrentMealPlan, deleteAllMealPlanSnapshots, deleteMealPlanSnapshot, readMealPlanHistory,  saveMealPlanSnapshot} from "./mealPlanStorage";
import { deleteAllMealPlans, deleteMealPlan as deleteMealPlanFromApi, loadMealPlans, saveMealPlan} from "./mealPlanApi";
import {
  readFavoriteMeals,
  removeFavoriteMeal,
  saveFavoriteMeal
} from "./favoriteMealsStorage";
import { getMealRecipe } from "./mealRecipeUtils";
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

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
const mealTypeImages = {
  Breakfast:
    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600",
  Lunch:
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600",
  Dinner:
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
  Snack:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600"
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

function getWeekStart(date) {
  const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  return weekStart;
}

function getWeekLabel(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Weekly plan";

  const weekStart = getWeekStart(date);
  const currentWeekStart = getWeekStart(new Date());
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  if (weekStart.getTime() === currentWeekStart.getTime()) return "This week";
  if (weekStart.getTime() === previousWeekStart.getTime()) return "Last week";
  return `Week of ${weekStart.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric"
  })}`;
}

function getPlanDate(plan) {
  const savedDate = Date.parse(plan.savedAt || plan.updatedAt || "");
  if (!Number.isNaN(savedDate)) return savedDate;

  const mealPlanDates = Object.keys(plan.mealPlan || {})
    .map(dateKey => Date.parse(`${dateKey}T00:00:00`))
    .filter(date => !Number.isNaN(date));
  return mealPlanDates.length ? Math.max(...mealPlanDates) : 0;
}

function MealPlanHistory({ onNavigate }) {
  const [plans, setPlans] = useState([]);
  const [openRecipe, setOpenRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [recipeSteps, setRecipeSteps] = useState("");
  const [recipeError, setRecipeError] = useState("");
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [planFilter, setPlanFilter] = useState("All");
  const [activePage, setActivePage] = useState("Generated Meal Plans");
  const [favorites, setFavorites] = useState(readFavoriteMeals);

  useEffect(() => {
    archiveCurrentMealPlan();
    let active = true;
    loadMealPlans()
      .then(databasePlans => {
        if (active) {
          setPlans(databasePlans.sort((a, b) => getPlanDate(b) - getPlanDate(a)));
        }
      })
      .catch(error => {
        if (active) {
          window.alert(error.message);
          setPlans(readMealPlanHistory().sort(
            (a, b) => getPlanDate(b) - getPlanDate(a)
          ));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const visiblePlans = plans.filter(plan =>
    planFilter === "All" ||
    plan.planType?.toLowerCase() === planFilter.toLowerCase()
  );
  const planGroups = planFilter === "All"
    ? ["Daily", "Weekly"].map(type => ({
        type,
        plans: plans.filter(
          plan => plan.planType?.toLowerCase() === type.toLowerCase()
        )
      }))
    : [{ type: planFilter, plans: visiblePlans }];

  const deletePlan = async plan => {
    const planLabel = plan.planType
      ? `${plan.planType.toLowerCase()} meal plan`
      : "meal plan";
    if (!window.confirm(`Delete this ${planLabel}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteMealPlanFromApi(plan.id);
      deleteMealPlanSnapshot(plan.id);
      setPlans(currentPlans => currentPlans.filter(item => item.id !== plan.id));
    } catch (error) {
      window.alert(error.message);
    }
  };

  const deleteAllPlans = async () => {
    if (!window.confirm("Delete all generated meal plans? This cannot be undone.")) {
      return;
    }

    try {
      await deleteAllMealPlans();
      deleteAllMealPlanSnapshots();
      setPlans([]);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleNavigation = page => {
    setActivePage(page);
    if (onNavigate) onNavigate(page);
  };

  const handleFavorite = (meal, type, recipe) => {
    const savedMeal = {
      name: meal.name,
      category: type,
      image: meal.image || recipe.image || mealTypeImages[type],
      calories: meal.calories ?? recipe.calories,
      price: meal.price ?? recipe.estimatedPrice,
      ingredients: meal.customIngredients || recipe.ingredients,
      steps: meal.customSteps || recipe.steps
    };
    const existing = favorites.find(favorite =>
      favorite.name === meal.name && favorite.category === type
    );
    if (existing) {
      setFavorites(removeFavoriteMeal(existing.id));
    } else {
      setFavorites(saveFavoriteMeal(savedMeal));
    }
  };

  const isFavorite = (meal, type) =>
    favorites.some(favorite =>
      favorite.name === meal.name && favorite.category === type
    );

  const openRecipeEditor = (plan, dateKey, type, meal) => {
    const recipe = getMealRecipe(meal, type);
    setEditingRecipe({ planId: plan.id, dateKey, type });
    setRecipeIngredients(
      (meal.customIngredients || recipe.ingredients).join("\n")
    );
    setRecipeSteps((meal.customSteps || recipe.steps).join("\n"));
    setRecipeError("");
    setOpenRecipe(null);
  };

  const saveCustomRecipe = async event => {
    event.preventDefault();
    if (!editingRecipe || savingRecipe) return;

    const ingredients = recipeIngredients
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);
    const steps = recipeSteps
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);

    if (!ingredients.length || !steps.length) {
      setRecipeError("Enter at least one ingredient and one cooking step.");
      return;
    }

    const currentPlan = plans.find(plan => plan.id === editingRecipe.planId);
    if (!currentPlan) {
      setRecipeError("This saved meal plan could not be found. Refresh and try again.");
      return;
    }

    const updatedDay = currentPlan.mealPlan?.[editingRecipe.dateKey];
    const currentMeal = updatedDay?.[editingRecipe.type];
    if (!updatedDay || !currentMeal) {
      setRecipeError("This meal could not be found in the saved plan. Refresh and try again.");
      return;
    }

    const updatedPlan = {
      ...currentPlan,
      mealPlan: {
        ...currentPlan.mealPlan,
        [editingRecipe.dateKey]: {
          ...updatedDay,
          [editingRecipe.type]: {
            ...currentMeal,
            customIngredients: ingredients,
            customSteps: steps
          }
        }
      }
    };

    setSavingRecipe(true);
    setRecipeError("");
    try {
      await saveMealPlan(currentPlan.id, updatedPlan, false);
      saveMealPlanSnapshot(updatedPlan, currentPlan.id);
      setPlans(current =>
        current.map(plan =>
          plan.id === currentPlan.id ? updatedPlan : plan
        )
      );
      setEditingRecipe(null);
    } catch (error) {
      setRecipeError(
        error instanceof Error
          ? error.message
          : "Unable to save your recipe. Please try again."
      );
    } finally {
      setSavingRecipe(false);
    }
  };

  return (
    <div className="meal-layout planner-layout">
      <aside className="meal-sidebar">
        <div className="meal-logo">
          <span className="logo-icon"></span>
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

    <main className="meal-history-page">
      <header className="meal-history-header">
        <div>
          <p className="meal-history-eyebrow">YOUR MEALMIND COLLECTION</p>
          <h1>Saved Meal Plans</h1>
          <p>Generated meal plans are kept here for you to revisit.</p>
        </div>
        <div className="meal-history-actions">
          <button
            className="meal-history-primary"
            onClick={() => onNavigate("Meal Planner")}
            type="button"
          >
            + Create a plan
          </button>
          <button
            className="meal-history-delete-all"
            disabled={plans.length === 0}
            onClick={deleteAllPlans}
            type="button"
          >
            Delete all
          </button>
        </div>
      </header>

      <div aria-label="Filter generated meal plans" className="meal-history-filters" role="group">
        {["All", "Daily", "Weekly"].map(filter => (
          <button
            aria-pressed={planFilter === filter}
            className={planFilter === filter ? "is-active" : ""}
            key={filter}
            onClick={() => setPlanFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      {visiblePlans.length === 0 ? (
        <section className="meal-history-empty">
          <span aria-hidden="true">🍽️</span>
          <h2>{plans.length ? `No ${planFilter.toLowerCase()} meal plans yet` : "No saved meal plans yet"}</h2>
          <p>
            {plans.length
              ? "Try another filter to see your generated meal plans."
              : "Generate a plan in Meal Planner and it will appear here."}
          </p>
          <button
            className="meal-history-primary"
            onClick={() => onNavigate("Meal Planner")}
            type="button"
          >
            Open Meal Planner
          </button>
        </section>
      ) : (
        <section aria-label="Saved meal plans" className="meal-history-groups">
          {planGroups.filter(group => group.plans.length > 0).map(group => (
            <div className="meal-history-group" key={group.type}>
              <h2 className="meal-history-group-heading">
                {group.type} Generated Plans
              </h2>
              <div className="meal-history-list">
                {group.plans.map(plan => {
            const mealPlan =
              plan.mealPlan && typeof plan.mealPlan === "object"
                ? plan.mealPlan
                : {};
            const planDays = Object.entries(mealPlan)
              .filter(([, day]) => day && typeof day === "object")
              .sort(([first], [second]) => first.localeCompare(second));
            const firstPlanDate = planDays[0]?.[0];
            const lastPlanDate = planDays[planDays.length - 1]?.[0];
            const isWeeklyPlan = plan.planType?.toLowerCase() === "weekly";
            const planTitle = isWeeklyPlan
              ? firstPlanDate && lastPlanDate
                ? `${getWeekLabel(firstPlanDate)} · ${formatPlanDate(firstPlanDate)}${firstPlanDate === lastPlanDate ? "" : ` – ${formatPlanDate(lastPlanDate)}`}`
                : "Weekly meal plan"
              : firstPlanDate
                ? formatPlanDate(firstPlanDate)
                : "Daily meal plan";
            const mealCount = planDays.reduce(
              (total, [, day]) =>
                total +
                Object.values(day).filter(meal => meal?.name).length,
              0
            );

            return (
              <article
                className={`meal-history-card ${isWeeklyPlan ? "is-weekly-plan" : "is-daily-plan"}`}
                key={plan.id}
              >
                <div className="meal-history-card-header">
                  <div>
                    <span className="meal-history-badge">
                      {plan.planType || "Meal"} plan
                    </span>
                    <h2>{planTitle}</h2>
                    <p>
                      Saved {new Date(plan.savedAt).toLocaleString()} ·{" "}
                      {mealCount} {mealCount === 1 ? "meal" : "meals"}
                    </p>
                  </div>
                  <div className="meal-history-card-actions">
                    <span className="meal-history-protein">
                      {Array.isArray(plan.protein)
                        ? plan.protein.join(", ") || "Personalized"
                        : plan.protein || "Personalized"}
                    </span>
                    <button
                      aria-label={`Delete ${plan.planType || "meal"} plan`}
                      className="meal-history-delete"
                      onClick={() => deletePlan(plan)}
                      type="button"
                    >
                      Delete plan
                    </button>
                  </div>
                </div>

                <div className="meal-history-days">
                  {planDays.map(([dateKey, day]) => (
                    <section className="meal-history-day" key={dateKey}>
                      <h3>{formatPlanDate(dateKey)}</h3>
                      <div className="meal-history-meals">
                        {mealTypes.map(type => {
                          const meal = day[type];
                          const recipeId = `${plan.id}-${dateKey}-${type}`;
                          const recipe = meal
                            ? {
                                ...getMealRecipe(meal, type),
                                ingredients: meal.customIngredients ||
                                  getMealRecipe(meal, type).ingredients,
                                steps: meal.customSteps ||
                                  getMealRecipe(meal, type).steps
                              }
                            : null;
                          return meal?.name ? (
                            <div className="meal-history-meal" key={type}>
                              <img
                                alt={meal.name}
                                className="meal-history-meal-image"
                                loading="lazy"
                                src={meal.image || mealTypeImages[type]}
                              />
                              <span>{type}</span>
                              <strong>{meal.name}</strong>
                              <small>
                                {(meal.calories ?? recipe.calories)
                                  ? `${meal.calories ?? recipe.calories} kcal`
                                  : ""}
                              </small>
                              <div className="meal-history-meal-actions">
                                <button
                                  aria-label={`${isFavorite(meal, type) ? "Remove" : "Add"} ${meal.name} ${isFavorite(meal, type) ? "from" : "to"} favorites`}
                                  aria-pressed={isFavorite(meal, type)}
                                  className={`meal-history-favorite-button${isFavorite(meal, type) ? " is-favorite" : ""}`}
                                  onClick={() => handleFavorite(meal, type, recipe)}
                                  title={isFavorite(meal, type) ? "Remove from favorites" : "Add to favorites"}
                                  type="button"
                                >
                                  {isFavorite(meal, type) ? "♥" : "♡"}
                                </button>
                                <button
                                  aria-expanded={openRecipe === recipeId}
                                  className="meal-history-recipe-button"
                                  onClick={() =>
                                    setOpenRecipe(current =>
                                      current === recipeId ? null : recipeId
                                    )
                                  }
                                  type="button"
                                >
                                  {openRecipe === recipeId
                                    ? "Hide Recipe"
                                    : "View Recipe"}
                                </button>
                                <button
                                  className="meal-history-custom-recipe-button"
                                  onClick={() =>
                                    openRecipeEditor(plan, dateKey, type, meal)
                                  }
                                  type="button"
                                >
                                  {meal.customIngredients?.length
                                    ? "Edit My Recipe"
                                    : "Add Your Recipe"}
                                </button>
                              </div>
                              {openRecipe === recipeId && (
                                <div className="meal-history-recipe">
                                  <h4>{recipe.name}</h4>
                                  <p className="meal-history-recipe-label">
                                    Ingredients
                                  </p>
                                  <ul>
                                    {recipe.ingredients.map((ingredient, index) => (
                                      <li key={`${ingredient}-${index}`}>
                                        {ingredient}
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="meal-history-recipe-label">
                                    Instructions
                                  </p>
                                  <ol>
                                    {recipe.steps.map((step, index) => (
                                      <li key={`${index}-${step}`}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              {editingRecipe?.planId === plan.id &&
                                editingRecipe.dateKey === dateKey &&
                                editingRecipe.type === type && (
                                  <form
                                    className="meal-history-recipe-editor"
                                    onSubmit={saveCustomRecipe}
                                  >
                                    <h4>Your recipe for {meal.name}</h4>
                                    <label htmlFor={`${recipeId}-ingredients`}>
                                      Ingredients (one per line)
                                    </label>
                                    <textarea
                                      id={`${recipeId}-ingredients`}
                                      onChange={event =>
                                        setRecipeIngredients(event.target.value)
                                      }
                                      required
                                      rows={5}
                                      value={recipeIngredients}
                                    />
                                    <label htmlFor={`${recipeId}-steps`}>
                                      Cooking process (one step per line)
                                    </label>
                                    <textarea
                                      id={`${recipeId}-steps`}
                                      onChange={event =>
                                        setRecipeSteps(event.target.value)
                                      }
                                      required
                                      rows={5}
                                      value={recipeSteps}
                                    />
                                    {recipeError && (
                                      <p className="meal-history-recipe-error" role="alert">
                                        {recipeError}
                                      </p>
                                    )}
                                    <div className="meal-history-recipe-editor-actions">
                                      <button
                                        className="meal-history-recipe-button"
                                        disabled={savingRecipe}
                                        type="submit"
                                      >
                                        {savingRecipe ? "Saving..." : "Save Recipe"}
                                      </button>
                                      <button
                                        className="meal-history-recipe-cancel"
                                        disabled={savingRecipe}
                                        onClick={() => {
                                          setEditingRecipe(null);
                                          setRecipeError("");
                                        }}
                                        type="button"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                )}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </article>
            );
                })}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
    </div>
  );
}

export default MealPlanHistory;
