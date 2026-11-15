import React, { useEffect, useState } from "react";
import PageFrame from "./PageFrame";
import { deleteMealPlan, loadMealPlans } from "./mealPlanApi";

export default function GeneratedMeal({ onNavigate }) {
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMealPlans().then(setPlans).catch(error => setMessage(error.message));
  }, []);

  async function handleDelete(id) {
    try {
      setPlans(await deleteMealPlan(id));
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <PageFrame title="Generated Meal Plans" onNavigate={onNavigate}>
      <section>
        {plans.map((plan, index) => (
          <article key={plan.id || index}>
            <h2>Meal Plan {index + 1}</h2>
            <p>{new Date(plan.updatedAt || plan.savedAt || Date.now()).toLocaleDateString()}</p>
            <button type="button" onClick={() => handleDelete(plan.id)}>Delete</button>
          </article>
        ))}
        {!plans.length && !message && <p>No generated meal plans yet.</p>}
        {message && <p role="alert">{message}</p>}
      </section>
    </PageFrame>
  );
}
