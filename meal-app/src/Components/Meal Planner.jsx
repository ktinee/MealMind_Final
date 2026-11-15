import React, { useState } from "react";
import PageFrame from "./PageFrame";
import { RECIPES_BY_MEAL } from "./AllRecipe";
import { saveMealPlan } from "./mealPlanApi";
import { toDateInputValue } from "./mealPlanUtils";
import { writeCurrentMealPlan } from "./mealPlanStorage";

const categories = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function MealPlanner({ onNavigate }) {
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [meals, setMeals] = useState({});
  const [message, setMessage] = useState("");

  async function handleSave() {
    const plan = {
      id: `meal-plan-${Date.now()}`,
      mealPlan: { [date]: meals },
      updatedAt: new Date().toISOString()
    };
    try {
      writeCurrentMealPlan(plan);
      await saveMealPlan(plan);
      setMessage("Meal plan saved.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <PageFrame title="Meal Planner" onNavigate={onNavigate}>
      <section className="planner-layout">
        <label>
          Plan date
          <input type="date" value={date} onChange={event => setDate(event.target.value)} />
        </label>
        {categories.map(category => (
          <label key={category}>
            {category}
            <select
              value={meals[category]?.name || ""}
              onChange={event => {
                const recipe = RECIPES_BY_MEAL[category].find(item => item.name === event.target.value);
                setMeals(current => ({ ...current, [category]: recipe || null }));
              }}
            >
              <option value="">Choose a meal</option>
              {RECIPES_BY_MEAL[category].map(recipe => (
                <option key={recipe.name} value={recipe.name}>{recipe.name}</option>
              ))}
            </select>
          </label>
        ))}
        <button type="button" onClick={handleSave}>Save Meal Plan</button>
        {message && <p role="status">{message}</p>}
      </section>
    </PageFrame>
  );
}
