import React from "react";
import PageFrame from "./PageFrame";
import { readCurrentMealPlan } from "./mealPlanStorage";

export default function ShoppingList({ onNavigate }) {
  const plan = readCurrentMealPlan();
  const ingredients = [...new Set(
    Object.values(plan?.mealPlan || {})
      .flatMap(day => Object.values(day || {}))
      .flatMap(meal => meal?.customIngredients || meal?.ingredients || [])
  )];

  return (
    <PageFrame title="Shopping List" onNavigate={onNavigate}>
      <section>
        {ingredients.map(item => <label key={item}><input type="checkbox" /> {item}</label>)}
        {!ingredients.length && <p>Save a meal plan to build your shopping list.</p>}
      </section>
    </PageFrame>
  );
}
