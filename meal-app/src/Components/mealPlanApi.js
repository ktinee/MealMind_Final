const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:3001")
  .replace(/\/+$/, "");
const SESSION_KEY = "mealmind_session";

function getSessionToken() {
  try {
    const savedSession = window.localStorage.getItem(SESSION_KEY);
    const session = savedSession ? JSON.parse(savedSession) : null;
    return session?.sessionToken;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const sessionToken = getSessionToken();
  if (!sessionToken) {
    throw new Error("Please log in again before using your meal plans.");
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      `Cannot connect to the MealMind server at ${API_BASE_URL}. Please start the backend and try again.`,
    );
  }

  if (!response.ok) {
    let message = "Unable to update your meal plans.";
    try {
      const result = await response.json();
      if (typeof result.error === "string") message = result.error;
    } catch {
      // Keep the generic message when the server does not return JSON.
    }
    if (response.status === 401) {
      window.localStorage.removeItem(SESSION_KEY);
      window.location.assign("/login");
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export function loadMealPlans() {
  return request("/api/meal-plans");
}

export function loadMostGeneratedMeals() {
  return request("/api/meal-stats/most-generated");
}

export function saveMealPlan(id, planner, isCurrent = true) {
  return request("/api/meal-plans", {
    method: "POST",
    body: JSON.stringify({ id, planner, isCurrent }),
  });
}

export function deleteMealPlan(id) {
  return request(`/api/meal-plans/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function deleteAllMealPlans() {
  return request("/api/meal-plans", { method: "DELETE" });
}
