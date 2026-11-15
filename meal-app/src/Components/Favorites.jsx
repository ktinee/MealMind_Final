import React, { useState } from "react";
import PageFrame from "./PageFrame";
import { readFavoriteMeals, removeFavoriteMeal } from "./favoriteMealsStorage";

export default function Favorites({ onNavigate }) {
  const [meals, setMeals] = useState(readFavoriteMeals);

  function handleRemove(id) {
    setMeals(removeFavoriteMeal(id));
  }

  return (
    <PageFrame title="Favorite Meals" onNavigate={onNavigate}>
      <section>
        {meals.map(meal => (
          <article key={meal.id}>
            <h2>{meal.name}</h2>
            <p>{meal.category}</p>
            <button type="button" onClick={() => handleRemove(meal.id)}>Remove</button>
          </article>
        ))}
        {!meals.length && <p>You have not saved any favorite meals yet.</p>}
      </section>
    </PageFrame>
  );
}
