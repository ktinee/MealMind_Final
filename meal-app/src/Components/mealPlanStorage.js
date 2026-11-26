const SESSION_KEY = "mealmind_session";

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
