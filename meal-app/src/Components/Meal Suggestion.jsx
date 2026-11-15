import React from "react";
import PageFrame from "./PageFrame";
import { RECIPES_BY_MEAL } from "./AllRecipe";

export default function MealSuggestion({ onNavigate }) {
  const recipes = Object.entries(RECIPES_BY_MEAL).flatMap(([category, meals]) =>
    meals.map(meal => ({ ...meal, category }))
  );

  return (
    <PageFrame title="Meal Suggestions" onNavigate={onNavigate}>
      <section>
        {recipes.map(meal => (
          <article key={`${meal.category}-${meal.name}`}>
            <h2>{meal.name}</h2>
            <p>{meal.category} · {meal.calories} kcal · ₱{meal.estimatedPrice}</p>
          </article>
        ))}
      </section>
    </PageFrame>
  );
}
