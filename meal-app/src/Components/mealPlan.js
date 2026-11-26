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

export function getMealMindStorageKey(baseKey) {
  try {
    const savedSession = localStorage.getItem(SESSION_KEY);
    const session = savedSession ? JSON.parse(savedSession) : null;
    const userKey = session?.userId || session?.username?.toLowerCase() || "guest";
    return `${baseKey}:${userKey}`;
  } catch {
    return `${baseKey}:guest`;
  }
}

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function createMealPlanId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function readCurrentMealPlan() {
  return readJson(getMealMindStorageKey("mealMindPlanner"), null);
}

export function writeCurrentMealPlan(planner) {
  localStorage.setItem(
    getMealMindStorageKey("mealMindPlanner"),
    JSON.stringify(planner),
  );
}

export function clearCurrentMealPlan() {
  localStorage.removeItem(getMealMindStorageKey("mealMindPlanner"));
}

export function readMealPlanHistory() {
  const history = readJson(getMealMindStorageKey("mealMindSavedMealPlans"), []);
  return Array.isArray(history)
    ? history.filter(plan => plan && typeof plan === "object" && plan.id)
    : [];
}

export function saveMealPlanSnapshot(planner, id) {
  const history = readMealPlanHistory();
  const existing = history.find(plan => plan.id === id);
  const timestamp = new Date().toISOString();
  const snapshot = {
    ...planner,
    id,
    savedAt: existing?.savedAt || timestamp,
    updatedAt: timestamp
  };
  const updatedHistory = [
    snapshot,
    ...history.filter(plan => plan.id !== id)
  ];

  localStorage.setItem(
    getMealMindStorageKey("mealMindSavedMealPlans"),
    JSON.stringify(updatedHistory),
  );
}

export function deleteMealPlanSnapshot(id) {
  const history = readMealPlanHistory();
  localStorage.setItem(
    getMealMindStorageKey("mealMindSavedMealPlans"),
    JSON.stringify(history.filter(plan => plan.id !== id))
  );

  const currentPlan = readCurrentMealPlan();
  if ((currentPlan?.planId || "legacy-current-plan") === id) {
    localStorage.removeItem(getMealMindStorageKey("mealMindPlanner"));
  }
}

export function deleteAllMealPlanSnapshots() {
  localStorage.setItem(getMealMindStorageKey("mealMindSavedMealPlans"), JSON.stringify([]));
  localStorage.removeItem(getMealMindStorageKey("mealMindPlanner"));
}

export function archiveCurrentMealPlan() {
  const planner = readCurrentMealPlan();
  const mealPlan = planner?.mealPlan;
  if (!mealPlan || typeof mealPlan !== "object" || Array.isArray(mealPlan)) {
    return;
  }

  const hasMeals = Object.values(mealPlan).some(
    day => day && typeof day === "object" && Object.keys(day).length > 0
  );
  if (hasMeals) {
    saveMealPlanSnapshot(planner, planner.planId || "legacy-current-plan");
  }
}

export function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value) {
  if (typeof value !== 'string') return new Date();
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return new Date();
  }
  return date;
}

export function isDateInputValue(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function getWeekDates(value) {
  const selectedDate = parseDateInputValue(value);
  const mondayOffset = (selectedDate.getDay() + 6) % 7;
  const monday = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate() - mondayOffset,
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + index,
    );

    return {
      date,
      dateKey: toDateInputValue(date),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      label: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  });
}
