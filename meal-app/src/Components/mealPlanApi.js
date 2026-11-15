import {
  readMealPlanHistory,
  removeMealPlanFromStorage,
  writeCurrentMealPlan
} from "./mealPlanStorage";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

function getSession() {
  try {
    return JSON.parse(window.localStorage.getItem("mealmind_session") || "null");
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const session = getSession();
  if (!session?.sessionToken) {
    throw new Error("Please log in to continue.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  if (!response.ok) {
    let message = "Unable to complete your meal plan request.";
    try {
      const result = await response.json();
      message = result.error || message;
    } catch {
      // Keep the request error when the server does not return JSON.
    }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

export async function loadMealPlans() {
  if (!getSession()?.sessionToken) return readMealPlanHistory();
  return request("/api/meal-plans");
}

export async function loadMostGeneratedMeals() {
  const plans = await loadMealPlans();
  const counts = new Map();
  plans.forEach(plan => {
    Object.values(plan.mealPlan || {}).forEach(day => {
      Object.entries(day || {}).forEach(([category, meal]) => {
        if (!meal?.name) return;
        const key = `${category}:${meal.name.toLowerCase()}`;
        const entry = counts.get(key) || { name: meal.name, category, count: 0 };
        entry.count += 1;
        counts.set(key, entry);
      });
    });
  });
  return [...counts.values()].sort((first, second) => second.count - first.count);
}

export async function saveMealPlan(plan) {
  const id = plan.id || plan.planId || `meal-plan-${Date.now()}`;
  const saved = { ...plan, id, updatedAt: new Date().toISOString() };
  if (getSession()?.sessionToken) {
    await request("/api/meal-plans", {
      method: "POST",
      body: JSON.stringify({ id, planner: plan, isCurrent: true })
    });
  }
  writeCurrentMealPlan(saved);
  return saved;
}

export async function deleteMealPlan(id) {
  if (getSession()?.sessionToken) {
    await request(`/api/meal-plans/${encodeURIComponent(id)}`, { method: "DELETE" });
  }
  return removeMealPlanFromStorage(id);
}

export async function deleteAllMealPlans() {
  if (getSession()?.sessionToken) {
    await request("/api/meal-plans", { method: "DELETE" });
  }
  readMealPlanHistory().forEach(plan => removeMealPlanFromStorage(plan.id));
}
