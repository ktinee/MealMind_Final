
import React, { useState } from "react";
import {  MAIN_INGREDIENT_CATEGORIES, RECIPES_BY_MEAL, getAllRecipe} from "./AllRecipe";
import { saveMealPlan, createMealPlanId, saveMealPlanSnapshot } from "./mealPlan";
import "./style.css";
import logo from "../Pages/logo.png";

const navItems = [
  { name: "Home", icon: "⌂" },
  { name: "Meal Planner", icon: "▦" },
  { name: "Generated Meal Plans", icon: "◷" },
  { name: "Shopping List", icon: "🛒" },
  { name: "Meal Suggestion", icon: "✧" },
  { name: "Favorites", icon: "♡" },
  { name: "Meal History", icon: "◴" }
];

const BUDGET_RANGES = {
  "100-300": { min: 100, max: 300, label: "₱100–₱300" },
  "300-500": { min: 300, max: 500, label: "₱300–₱500" },
  "500-1000": { min: 500, max: 1000, label: "₱500–₱1,000" },
  "1000+": { min: 1000, max: Infinity, label: "₱1,000 and above" }
};

const MEAL_TYPES = ["Breakfast", "Lunch", "Snack", "Dinner"];

const formatDate = date =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

const getRecipeText = recipe =>
  `${recipe?.name || ""} ${(recipe?.ingredients || []).join(" ")}`.toLowerCase();

const matchesPreferredIngredient = (recipe, preferences) => {
  if (!preferences.length) return true;

  return preferences.includes(recipe.mainIngredient) ||
    recipe.mainIngredient === "Other";
};

const getGroceryMatches = (recipe, groceries) => {
  const text = getRecipeText(recipe);

  return groceries.filter(item => text.includes(item)).length;
};

const getRecipePool = (type, preferences, groceries, excluded = []) => {
  const allRecipes = (RECIPES_BY_MEAL[type] || []).filter(
    recipe => !excluded.includes(recipe.name)
  );

  let recipes = allRecipes.filter(recipe =>
    matchesPreferredIngredient(recipe, preferences)
  );

  if (!recipes.length) recipes = allRecipes;

  if (groceries.length) {
    const matchingRecipes = recipes.filter(
      recipe => getGroceryMatches(recipe, groceries) > 0
    );

    if (matchingRecipes.length) recipes = matchingRecipes;
  }

  return recipes;
};

const getDailyPlan = (budgetKey, preferences, groceries) => {
  const budget = BUDGET_RANGES[budgetKey];

  for (let attempt = 0; attempt < 3000; attempt++) {
    const meals = MEAL_TYPES.map(type => {
      const recipes = getRecipePool(type, preferences, groceries);

      if (!recipes.length) return null;

      return {
        type,
        meal: recipes[Math.floor(Math.random() * recipes.length)]
      };
    });

    if (meals.some(item => !item)) return null;

    const total = meals.reduce(
      (sum, item) => sum + Number(item.meal.price || 0),
      0
    );

    if (total >= budget.min && total <= budget.max) {
      return { meals, total };
    }
  }

  return null;
};

function MealPlanner({ onNavigate }) {
  const [planType, setPlanType] = useState("Daily");
  const [budget, setBudget] = useState("100-300");

  const [startDate, setStartDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const [availableGroceries, setAvailableGroceries] = useState("");
  const [preferredIngredients, setPreferredIngredients] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const groceryItems = availableGroceries
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

  const handleNavigation = page => {
    if (onNavigate) onNavigate(page);
  };

  const togglePreferredIngredient = ingredient => {
    setPreferredIngredients(current =>
      current.includes(ingredient)
        ? current.filter(item => item !== ingredient)
        : [...current, ingredient]
    );

    setMealPlan([]);
    setMessage("");
  };

  const generatePlan = () => {
    if (!startDate) {
      setMessage("Please select a starting date.");
      return;
    }

    const numberOfDays = planType === "Daily" ? 1 : 7;
    const newPlan = [];

    for (let i = 0; i < numberOfDays; i++) {
      const date = new Date(`${startDate}T12:00:00`);
      date.setDate(date.getDate() + i);

      const dailyPlan = getDailyPlan(
        budget,
        preferredIngredients,
        groceryItems
      );

      if (!dailyPlan) {
        setMealPlan([]);
        setMessage(
          `No combination of recipe prices fits your ${BUDGET_RANGES[budget].label} daily budget. Try another budget or update recipe prices in AllRecipe.js.`
        );
        return;
      }

      newPlan.push({
        date: date.toLocaleDateString("en-CA"),
        meals: dailyPlan.meals,
        total: dailyPlan.total
      });
    }

    setMealPlan(newPlan);
    setMessage("");
  };

  const changeMeal = (dayIndex, mealIndex) => {
    const updatedPlan = [...mealPlan];
    const currentDay = { ...updatedPlan[dayIndex] };
    const oldMeal = currentDay.meals[mealIndex];

    const otherMealsTotal =
      currentDay.total - Number(oldMeal.meal.price || 0);

    const budgetRange = BUDGET_RANGES[budget];

    const alternatives = getRecipePool(
      oldMeal.type,
      preferredIngredients,
      groceryItems
    ).filter(recipe => {
      const newTotal =
        otherMealsTotal + Number(recipe.price || 0);

      return (
        recipe.name !== oldMeal.meal.name &&
        newTotal >= budgetRange.min &&
        newTotal <= budgetRange.max
      );
    });

    if (!alternatives.length) {
      setMessage(
        `No alternative ${oldMeal.type.toLowerCase()} fits your selected budget and preferences.`
      );
      return;
    }

    const replacement =
      alternatives[Math.floor(Math.random() * alternatives.length)];

    currentDay.meals = [...currentDay.meals];

    currentDay.meals[mealIndex] = {
      type: oldMeal.type,
      meal: replacement
    };

    currentDay.total =
      otherMealsTotal + Number(replacement.price || 0);

    updatedPlan[dayIndex] = currentDay;

    setMealPlan(updatedPlan);
    setMessage("");
  };

  const saveGeneratedPlan = async () => {
    if (!mealPlan.length || isSaving) return;

    const planId = createMealPlanId();
    const savedPlan = {
      planId,
      planType,
      budget,
      protein: preferredIngredients,
      groceries: availableGroceries,
      mealPlan: Object.fromEntries(
        mealPlan.map(day => [
          day.date,
          Object.fromEntries(
            day.meals.map(({ type, meal }) => [
              type,
              {
                name: meal.name,
                price: meal.price,
                calories: meal.calories,
                mainIngredient: meal.mainIngredient,
                ingredients: meal.ingredients
              }
            ])
          )
        ])
      )
    };

    setIsSaving(true);
    setMessage("");

    try {
      await saveMealPlan(planId, savedPlan, false);
      saveMealPlanSnapshot(savedPlan, planId);
      handleNavigation("Generated Meal Plans");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Unable to save this meal plan: ${error.message}`
          : "Unable to save this meal plan. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openRecipe = (meal, mealType) => {
    setSelectedRecipe(getAllRecipe(meal, mealType));
  };

  const weeklyTotal = mealPlan.reduce(
    (sum, day) => sum + day.total,
    0
  );

  return (
    <div className="meal-layout planner-layout">

      <aside className="meal-sidebar">
        <div className="meal-logo">
          <img className="meal-logo-image" src={logo} alt="MealMind" />
        </div>

        <p className="sidebar-label">MENU</p>

        <nav className="sidebar-links" aria-label="Main navigation">
          {navItems.map(item => (
            <button
              aria-current={
                item.name === "Meal Planner" ? "page" : undefined
              }
              className={`sidebar-btn${
                item.name === "Meal Planner" ? " selected" : ""
              }`}
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

      <main className="meal-main planner-main">
        <div className="meal-planner-page">

          <div className="planner-header">
            <div>
              <span className="planner-label">MEALMIND PLANNER</span>
              <h1>Meal Planner</h1>
              <p>Plan your meals and manage your food budget.</p>
            </div>

            <div className="planner-icon">🍽️</div>
          </div>

          <div className="planner-settings">

            <div className="planner-setting">
              <label>Planning Type</label>

              <div className="planner-toggle">
                <button
                  type="button"
                  className={planType === "Daily" ? "active" : ""}
                  onClick={() => {
                    setPlanType("Daily");
                    setMealPlan([]);
                    setMessage("");
                  }}
                >
                  Daily
                </button>

                <button
                  type="button"
                  className={planType === "Weekly" ? "active" : ""}
                  onClick={() => {
                    setPlanType("Weekly");
                    setMealPlan([]);
                    setMessage("");
                  }}
                >
                  Weekly
                </button>
              </div>
            </div>

            <div className="planner-setting">
              <label htmlFor="planner-date">Start Date</label>

              <input
                id="planner-date"
                type="date"
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value);
                  setMealPlan([]);
                  setMessage("");
                }}
              />
            </div>

            <div className="planner-setting">
              <label htmlFor="planner-budget">Daily Budget</label>

              <select
                id="planner-budget"
                value={budget}
                onChange={e => {
                  setBudget(e.target.value);
                  setMealPlan([]);
                  setMessage("");
                }}
              >
                <option value="100-300">₱100–₱300</option>
                <option value="300-500">₱300–₱500</option>
                <option value="500-1000">₱500–₱1,000</option>
                <option value="1000+">₱1,000 and above</option>
              </select>
            </div>

          </div>

          <div className="planner-extra-settings">

            <div className="planner-extra-card">
              <div className="planner-extra-heading">
                <span className="planner-extra-icon">🧺</span>

                <div>
                  <h3>Available Groceries</h3>
                  <p>Enter the ingredients you already have at home.</p>
                </div>
              </div>

              <label htmlFor="available-groceries">
                Your ingredients
              </label>

              <input
                id="available-groceries"
                type="text"
                value={availableGroceries}
                onChange={e => {
                  setAvailableGroceries(e.target.value);
                  setMealPlan([]);
                  setMessage("");
                }}
                placeholder="Example: rice, egg, tomato, onion, garlic"
              />

              <small>Separate each ingredient with a comma.</small>
            </div>

            <div className="planner-extra-card">
              <div className="planner-extra-heading">
                <span className="planner-extra-icon">🥗</span>

                <div>
                  <h3>Preferred Main Ingredients</h3>
                  <p>You can select more than one.</p>
                </div>
              </div>

              <div className="ingredient-options">
                {MAIN_INGREDIENT_CATEGORIES.map(ingredient => (
                  <label
                    className="ingredient-option"
                    key={ingredient}
                  >
                    <input
                      type="checkbox"
                      checked={preferredIngredients.includes(ingredient)}
                      onChange={() =>
                        togglePreferredIngredient(ingredient)
                      }
                    />

                    <span>{ingredient}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          <button
            className="generate-plan-btn"
            onClick={generatePlan}
            type="button"
          >
            ✨ Generate Meal Plan
          </button>

          {message && (
            <div className="planner-message">
              {message}
            </div>
          )}

          {mealPlan.length > 0 && (
            <>

              <div className="planner-summary">

                <div className="summary-card">
                  <span>Planning Type</span>
                  <h3>{planType} Plan</h3>
                </div>

                <div className="summary-card">
                  <span>Selected Daily Budget</span>
                  <h3>{BUDGET_RANGES[budget].label}</h3>
                </div>

                <div className="summary-card">
                  <span>Estimated Total</span>
                  <h3>₱{weeklyTotal.toLocaleString("en-PH")}</h3>
                </div>

              </div>

              <div className="generated-heading">
                <div>
                  <span className="planner-label">YOUR MEALS</span>

                  <h2>
                    {planType === "Daily"
                      ? "Your Daily Meal Plan"
                      : "Your Weekly Meal Plan"}
                  </h2>

                  <p>
                    {preferredIngredients.length
                      ? `Preferences: ${preferredIngredients.join(", ")}`
                      : "Showing meals from all available main ingredients"}
                  </p>
                </div>
              </div>

              <div className="generated-days">

                {mealPlan.map((day, dayIndex) => (
                  <div className="generated-day" key={day.date}>

                    <div className="day-heading">
                      <div>
                        <span>DAY {dayIndex + 1}</span>
                        <h3>{formatDate(day.date)}</h3>
                      </div>

                      <div className="day-total">
                        <span>Daily Total</span>
                        <strong>
                          ₱{day.total.toLocaleString("en-PH")}
                        </strong>
                      </div>
                    </div>

                    <div className="generated-meals">

                      {day.meals.map((item, mealIndex) => (
                        <div
                          className="generated-meal-card"
                          key={`${day.date}-${item.type}`}
                        >

                          <div className="meal-card-top">
                            <span className="meal-type-tag">
                              {item.type}
                            </span>
                            <span className="main-ingredient-tag">
                              {item.meal.mainIngredient}
                            </span>

                            <span className="meal-price">
                              ₱{item.meal.price} · {item.meal.calories} kcal
                            </span>
                          </div>

                          <div className="meal-card-content">
                            <h3>{item.meal.name}</h3>

                            <p>
                              {(item.meal.ingredients || [])
                                .slice(0, 3)
                                .join(", ")}
                            </p>
                          </div>

                          <div className="meal-card-actions">

                            <button
                              className="recipe-btn"
                              type="button"
                              onClick={() =>
                                openRecipe(item.meal, item.type)
                              }
                            >
                              View Recipe
                            </button>

                            <button
                              className="change-meal-btn"
                              type="button"
                              onClick={() =>
                                changeMeal(dayIndex, mealIndex)
                              }
                            >
                              ↻ Change
                            </button>

                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                ))}

              </div>

              <button
                className="save-generated-plan-btn"
                disabled={isSaving}
                onClick={saveGeneratedPlan}
                type="button"
              >
                {isSaving ? "Saving plan..." : "Save to Generated Meal Plans"}
              </button>

            </>
          )}

          {!mealPlan.length && !message && (
            <div className="planner-empty">
              <div>🥗</div>

              <h2>Ready to plan your meals?</h2>

              <p>
                Choose your planning type, date, budget, available
                groceries, and preferred main ingredients.
                MealMind will generate your breakfast, lunch,
                snack, and dinner.
              </p>
            </div>
          )}

          {selectedRecipe && (
            <div
              className="recipe-overlay"
              onClick={() => setSelectedRecipe(null)}
            >
              <div
                className="recipe-modal"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="recipe-close"
                  type="button"
                  onClick={() => setSelectedRecipe(null)}
                >
                  ×
                </button>

                <span className="recipe-category">
                  {selectedRecipe.mealType}
                </span>

                <h2>{selectedRecipe.name}</h2>
                <p className="recipe-main-ingredient">
                  Main ingredient: {selectedRecipe.mainIngredient}
                </p>

                <div className="recipe-price">
                  Estimated Cost: ₱{selectedRecipe.estimatedPrice}
                  <span> per serving</span>
                </div>
                <div className="recipe-price">
                  Calories: {selectedRecipe.calories} kcal
                  <span> per serving</span>
                </div>

                <h3>🥕 Ingredients</h3>

                <ul>
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>

                <h3>👩‍🍳 Cooking Process</h3>

                <ol>
                  {selectedRecipe.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default MealPlanner;
