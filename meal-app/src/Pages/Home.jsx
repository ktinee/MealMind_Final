
import React, { useEffect, useState } from "react";
import Profile from "./Profile";
import MealPlanner from "../Components/Meal Planner";
import MealPlanHistory from "../Components/GeneratedMeal";
import PastMealHistory from "../Components/MealHistory";
import ShoppingList from "../Components/ShoppingList";
import MealSuggestion from "../Components/Meal Suggestion";
import Favorites from "../Components/Favorites";
import { RECIPES_BY_MEAL } from "../Components/AllRecipe";
import {
  loadMealPlans,
  loadMostGeneratedMeals
} from "../Components/mealPlanApi";
import {
  readFavoriteMeals,
  removeFavoriteMeal,
  saveFavoriteMeal
} from "../Components/favoriteMealsStorage";
import { toDateInputValue } from "../Components/mealPlanUtils";
import {
  readCurrentMealPlan,
  readMealPlanHistory
} from "../Components/mealPlanStorage";
import { getMealRecipe } from "../Components/mealRecipeUtils";
import './style.css';
import logo from "./logo.png";

const SESSION_KEY = "mealmind_session";

function getSessionUsername() {
  try {
    const savedSession = window.localStorage.getItem(SESSION_KEY);
    const session = savedSession ? JSON.parse(savedSession) : null;
    return typeof session?.username === "string" && session.username.trim()
      ? session.username.trim()
      : "User";
  } catch {
    return "User";
  }
}

const meals = ["Breakfast", "Lunch", "Snack", "Dinner"].flatMap(category =>
  (RECIPES_BY_MEAL[category] || []).map(recipe => ({
    ...recipe,
    id: `${category}-${recipe.name}`,
    category
  }))
);

function readLocalMealPlans() {
  const savedPlans = readMealPlanHistory();
  const currentPlan = readCurrentMealPlan();
  if (!currentPlan?.mealPlan) return savedPlans;

  const currentPlanId = currentPlan.planId || "legacy-current-plan";
  return [
    { ...currentPlan, id: currentPlanId },
    ...savedPlans.filter(plan => plan.id !== currentPlanId)
  ];
}

function mergeMealPlans(primaryPlans, fallbackPlans) {
  const plansById = new Map(
    fallbackPlans.map(plan => [plan.id, plan])
  );
  primaryPlans.forEach(plan => plansById.set(plan.id, plan));
  return [...plansById.values()];
}

const plannedMealImages = {
  Breakfast:
    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600",
  Lunch:
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600",
  Snack:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
  Dinner:
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600"
};

const navigation = [
  { name: "Home", icon: "⌂" },
  { name: "Meal Planner", icon: "▦" },
  { name: "Generated Meal Plans", icon: "◷", page: "Generated Meal Plans" },
  { name: "Shopping List", icon: "🛒" },
  { name: "Meal Suggestion", icon: "✧" },
  { name: "Favorites", icon: "♡" },
  { name: "Meal History", icon: "◴" }
];

function Home({ onNavigate, initialPage = "Home" }) {
  const [activePage, setActivePage] = useState(initialPage);
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites] = useState(readFavoriteMeals);
  const [search, setSearch] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openMealRecipe, setOpenMealRecipe] = useState(null);
  const [openRecommendationRecipe, setOpenRecommendationRecipe] = useState(null);
  const [mealPlans, setMealPlans] = useState(readLocalMealPlans);
  const [mostGeneratedMeal, setMostGeneratedMeal] = useState(null);
  const username = getSessionUsername();

  useEffect(() => {
    if (activePage !== "Home") return undefined;

    let active = true;
    setMealPlans(readLocalMealPlans());
    loadMealPlans()
      .then(plans => {
        if (active) setMealPlans(mergeMealPlans(plans, readLocalMealPlans()));
      })
      .catch(error => {
        if (active) window.alert(error.message);
      });
    loadMostGeneratedMeals()
      .then(meals => {
        if (active) setMostGeneratedMeal(meals[0] || null);
      })
      .catch(error => {
        if (active) window.alert(error.message);
      });
    return () => {
      active = false;
    };
  }, [activePage]);

  const today = new Date();
  const todayKey = toDateInputValue(today);
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const planForToday = mealPlans
    .map(plan => ({
      day: plan.mealPlan?.[todayKey] || plan.mealPlan?.[weekday],
      timestamp: Date.parse(plan.updatedAt || plan.savedAt || "") || 0
    }))
    .filter(plan => plan.day)
    .sort((first, second) => second.timestamp - first.timestamp)[0]?.day || {};
  const dailyMeals = ["Breakfast", "Lunch", "Dinner", "Snack"].map(category => {
    const plannedMeal = planForToday[category];
    const recipe = plannedMeal?.name
      ? getMealRecipe(plannedMeal, category)
      : null;
    return {
      category,
      name: plannedMeal?.name || "No meal planned",
      calories: plannedMeal?.calories ?? recipe?.calories ?? 0,
      price: plannedMeal?.price ?? recipe?.estimatedPrice ?? 0,
      isPlanned: Boolean(plannedMeal?.name),
      image: plannedMeal?.image || recipe?.image || plannedMealImages[category],
      recipe
    };
  });

  const totalCalories = dailyMeals.reduce(
    (total, meal) => total + Number(meal.calories || 0), 0
  );
  const totalEstimatedCost = dailyMeals.reduce(
    (total, meal) => total + Number(meal.price || 0), 0
  );
  const featuredMeal = mostGeneratedMeal
    ? meals.find(meal =>
        meal.category === mostGeneratedMeal.category &&
        meal.name.toLowerCase() === mostGeneratedMeal.name.toLowerCase()
      )
    : null;
  const featuredRecipe = featuredMeal
    ? getMealRecipe(featuredMeal, featuredMeal.category)
    : null;

  useEffect(() => {
    if (!mostGeneratedMeal) return;

    const savedMeal = mealPlans
      .flatMap(plan => Object.values(plan.mealPlan || {}))
      .map(day => day?.[mostGeneratedMeal.category])
      .find(meal =>
        typeof meal?.name === "string" &&
        meal.name.trim().toLowerCase() === mostGeneratedMeal.name.toLowerCase()
      );
    const mealDetails = savedMeal || featuredMeal || mostGeneratedMeal;
    const recipe = getMealRecipe(mealDetails, mostGeneratedMeal.category);

    setFavorites(saveFavoriteMeal({
      name: mostGeneratedMeal.name,
      category: mostGeneratedMeal.category,
      image: mealDetails.image || recipe.image || plannedMealImages[mostGeneratedMeal.category],
      calories: mealDetails.calories ?? recipe.calories,
      price: mealDetails.price ?? recipe.estimatedPrice,
      ingredients: mealDetails.customIngredients || mealDetails.ingredients || recipe.ingredients,
      steps: mealDetails.customSteps || mealDetails.steps || recipe.steps
    }));
  }, [mostGeneratedMeal, mealPlans, featuredMeal]);

  const categories = ["All", "Breakfast", "Lunch", "Snack", "Dinner"];

  const matchingMeals = meals.filter(meal => {
    const matchesCategory =
      activeCategory === "All" || meal.category === activeCategory;

    const matchesSearch =
      meal.name.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });
  const filteredMeals = activeCategory === "All"
    ? categories.slice(1).flatMap(category =>
        matchingMeals
          .filter(meal => meal.category === category)
          .slice(0, 2)
      )
    : matchingMeals.slice(0, 8);

  const handleNavigation = (page) => {
    if (page === "My Profile") {
      setIsProfileOpen(true);
      return;
    }

    if (page === "Logout") {
      window.localStorage.removeItem(SESSION_KEY);
      window.location.assign("/login");
      return;
    }

    setActivePage(page);

    if (onNavigate) {
      onNavigate(page);
    }
  };

  const renderProfile = () => isProfileOpen ? (
    <Profile
      onClose={() => setIsProfileOpen(false)}
      favoriteMeals={favorites}
      onAddFavorites={() => {
        setIsProfileOpen(false);
        handleNavigation("Favorites");
      }}
    />
  ) : null;

  const isFavorite = meal =>
    favorites.some(favorite =>
      favorite.name === meal.name && favorite.category === meal.category
    );

  const toggleFavorite = meal => {
    const existing = favorites.find(favorite =>
      favorite.name === meal.name && favorite.category === meal.category
    );
    if (existing) {
      setFavorites(removeFavoriteMeal(existing.id));
      return;
    }

    const recipe = getMealRecipe(meal, meal.category);
    setFavorites(saveFavoriteMeal({
      name: meal.name,
      category: meal.category,
      image: meal.image || recipe.image,
      calories: meal.calories ?? recipe.calories,
      price: meal.price ?? recipe.estimatedPrice,
      ingredients: recipe.ingredients,
      steps: recipe.steps
    }));
  };

  if (activePage === "Meal Planner") {
    return (
      <>
        <MealPlanner onNavigate={handleNavigation} />
        {renderProfile()}
      </>
    );
  }

  if (activePage === "Generated Meal Plans") {
    return (
      <>
        <MealPlanHistory onNavigate={handleNavigation} />
        {renderProfile()}
      </>
    );
  }

  if (activePage === "Meal History") {
    return (
      <>
        <PastMealHistory onNavigate={handleNavigation} />
        {renderProfile()}
      </>
    );
  }

  if (activePage === "Shopping List") {
    return (
      <>
        <ShoppingList onNavigate={handleNavigation} />
        {renderProfile()}
      </>
    );
  }

  if (activePage === "Meal Suggestion") {
    return (
      <>
        <MealSuggestion onNavigate={handleNavigation} />
        {renderProfile()}
      </>
    );
  }

  if (activePage === "Favorites") {
    return (
      <>
        <Favorites onNavigate={handleNavigation} />
        {renderProfile()}
      </>
    );
  }

  return (
    <div className="meal-layout">

      {/* SIDEBAR */}
      <aside className="meal-sidebar">

        <div className="meal-logo">
          <img className="meal-logo-image" src={logo} alt="MealMind" />
        </div>

        <p className="sidebar-label">MENU</p>

        <div className="sidebar-links">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`sidebar-btn ${
                activePage === (item.page || item.name) ? "selected" : ""
              }`}
              onClick={() => handleNavigation(item.page || item.name)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>

        <button
          className="logout-btn"
          onClick={() => handleNavigation("Logout")}
        >
          ↪ Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="meal-main">

        {/* HEADER */}
        <header className="meal-header">

          <div>
            <p className="header-small">YOUR HEALTHY FOOD COMPANION</p>
            <h2>Hello, {username}</h2>
          </div>

          <div className="home-header-actions">
            <button
              className="profile-btn"
              onClick={() => setIsProfileOpen(true)}
              type="button"
            >
              <span>👤</span> My Profile
            </button>
          </div>

        </header>

        {/* WELCOME AND CALORIES */}
        <div className="welcome-grid">

          <div className="welcome-card">
            <div className="favorite-meal-heading">
              <span className="welcome-icon">⭐</span>
              <p>MOST GENERATED MEAL</p>
            </div>
            <div className="favorite-meal-content">
              {featuredMeal && (
                <img
                  alt={featuredMeal.name}
                  className="favorite-meal-image"
                  loading="lazy"
                  src={featuredMeal.image}
                />
              )}
              <div className="favorite-meal-info">
                <h1>{mostGeneratedMeal?.name || "No generated meals yet"}</h1>
                {mostGeneratedMeal ? (
                  <span>
                    {mostGeneratedMeal.category} ·                     {mostGeneratedMeal.count}{" "}
                    {mostGeneratedMeal.count === 1 ? "point" : "points"}
                    {featuredRecipe ? ` · ${featuredRecipe.calories} kcal` : ""}
                  </span>
                ) : (
                  <span>Generate and save a meal plan to see your most chosen meal.</span>
                )}
              </div>
            </div>
          </div>

          <div className="calorie-card">
            <div className="calorie-top">
              <span>🔥</span>
              <p>DAILY CALORIES</p>
            </div>

            <h1>{totalCalories.toLocaleString()}</h1>
            <p className="calorie-description">
              Total calories from today's generated meals
            </p>

            <div className="calorie-progress">
              <div></div>
            </div>
          </div>

          <div className="cost-card">
            <div className="cost-card-heading">
              <span>🧾</span>
              <p>ESTIMATED MEAL COST</p>
            </div>
            <h1>₱{totalEstimatedCost.toLocaleString()}</h1>
            <p className="cost-card-description">
              Total for today's generated meals
            </p>
          </div>

        </div>

        {/* TODAY'S MEAL PLAN */}
        <div className="meal-section">

          <div className="section-title">
            <div>
              <h2>Today's Meal Plan</h2>
              <p>Your meals scheduled for today</p>
            </div>

            <div className="meal-section-actions">
              <button
                className="view-btn"
                onClick={() => handleNavigation("Generated Meal Plans")}
              >
                View Generated Plans →
              </button>
            </div>
          </div>

          <div className="daily-meal-grid">

            {dailyMeals.map((meal) => (
              <div className="daily-card" key={meal.category}>

                <div className="daily-card-top">
                  <span>{meal.category}</span>
                  <span className="meal-check">{meal.isPlanned ? "✓" : "·"}</span>
                </div>

                {meal.isPlanned && (
                  <img
                    alt={meal.name}
                    className="daily-card-image"
                    loading="lazy"
                    src={meal.image}
                  />
                )}
                <h3>{meal.name}</h3>

                <p>
                  {meal.isPlanned
                    ? `🔥 ${meal.calories} kcal`
                    : "Add a meal in Meal Planner"}
                </p>

                {meal.isPlanned && (
                  <>
                    <button
                      aria-expanded={openMealRecipe === meal.category}
                      className="daily-recipe-button"
                      onClick={() =>
                        setOpenMealRecipe(current =>
                          current === meal.category ? null : meal.category
                        )
                      }
                      type="button"
                    >
                      {openMealRecipe === meal.category
                        ? "Hide Recipe"
                        : "View Recipe"}
                    </button>
                    {openMealRecipe === meal.category && (
                      <div className="daily-recipe-details">
                        <strong>Ingredients</strong>
                        <ul>
                          {meal.recipe.ingredients.map((ingredient, index) => (
                            <li key={`${ingredient}-${index}`}>{ingredient}</li>
                          ))}
                        </ul>
                        <strong>Instructions</strong>
                        <ol>
                          {meal.recipe.steps.map((step, index) => (
                            <li key={`${index}-${step}`}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </>
                )}

              </div>
            ))}

          </div>

        </div>

        {/* MEAL RECOMMENDATIONS */}
        <div className="meal-section">

          <div className="section-title">
            <div>
              <h2>Meal Recommendations</h2>
              <p>Discover something delicious today!</p>
            </div>

            <button
              className="view-btn"
              onClick={() => handleNavigation("Meal Suggestion")}
            >
              Explore More →
            </button>
          </div>

          {/* CATEGORY BUTTONS */}
          <div className="meal-filter">

            {categories.map(category => (
              <button
                key={category}
                className={
                  activeCategory === category ? "filter-active" : ""
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}

          </div>

          {/* SEARCH */}
          <input
            className="meal-search"
            type="text"
            placeholder="🔍 Search your favorite meals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* RECOMMENDED MEALS */}
          <div className="recommended-grid">

            {filteredMeals.map(meal => (

              <div className="recommend-card" key={meal.id}>

                <div className="meal-image">
                  <img src={meal.image} alt={meal.name} />

                  <button
                    aria-label={`${isFavorite(meal) ? "Remove" : "Add"} ${meal.name} ${isFavorite(meal) ? "from" : "to"} favorites`}
                    aria-pressed={isFavorite(meal)}
                    className={`favorite-btn${isFavorite(meal) ? " is-favorite" : ""}`}
                    onClick={() => toggleFavorite(meal)}
                    title={isFavorite(meal) ? "Remove from favorites" : "Add to favorites"}
                    type="button"
                  >
                    {isFavorite(meal) ? "♥" : "♡"}
                  </button>

                  <span className="image-category">
                    {meal.category}
                  </span>
                </div>

                <div className="recommend-info">

                  <h3>{meal.name}</h3>

                  <div className="recommend-bottom">
                  <span>🔥 {meal.calories} kcal</span>

                    <button
                    aria-expanded={openRecommendationRecipe === meal.id}
                    onClick={() =>
                      setOpenRecommendationRecipe(current =>
                        current === meal.id ? null : meal.id
                      )
                    }
                    type="button"
                  >
                    {openRecommendationRecipe === meal.id
                      ? "Hide Recipe"
                      : "View Recipe →"}
                  </button>
                </div>

                {openRecommendationRecipe === meal.id && (
                  <div className="daily-recipe-details">
                    <strong>Ingredients</strong>
                    <ul>
                      {meal.ingredients.map((ingredient, index) => (
                        <li key={`${ingredient}-${index}`}>{ingredient}</li>
                      ))}
                    </ul>
                    <strong>Instructions</strong>
                    <ol>
                      {meal.process.map((step, index) => (
                        <li key={`${index}-${step}`}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                </div>

              </div>

            ))}

            {filteredMeals.length === 0 && (
              <div className="no-meals">
                No meals found. Try another search.
              </div>
            )}

          </div>

        </div>
      </main>

      {renderProfile()}
    </div>
  );
}

export default Home;
