import React from "react";
import PageFrame from "./PageFrame";
import { readMealPlanHistory } from "./mealPlanStorage";

export default function MealHistory({ onNavigate }) {
  const plans = readMealPlanHistory();
  const entries = plans.flatMap(plan =>
    Object.entries(plan.mealPlan || {}).flatMap(([date, meals]) =>
      Object.entries(meals || {}).filter(([, meal]) => meal?.name)
        .map(([category, meal]) => ({ date, category, name: meal.name }))
    )
  );

  return (
    <PageFrame title="Meal History" onNavigate={onNavigate}>
      <section>
        {entries.map((meal, index) => (
          <article key={`${meal.date}-${meal.category}-${index}`}>
            <h2>{meal.name}</h2>
            <p>{meal.category} · {meal.date}</p>
          </article>
        ))}
        {!entries.length && <p>Your saved meals will appear here.</p>}
      </section>
    </PageFrame>
  );
}
