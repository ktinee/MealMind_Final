function getUserKey() {
  try {
    const session = JSON.parse(window.localStorage.getItem("mealmind_session") || "null");
    return session?.userId || session?.username || "guest";
  } catch {
    return "guest";
  }
}

function readList(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function readMealPlanHistory() {
  return readList(`mealMindSavedMealPlans:${getUserKey()}`);
}

export function readCurrentMealPlan() {
  try {
    return JSON.parse(
      window.localStorage.getItem(`mealMindCurrentMealPlan:${getUserKey()}`) || "null"
    );
  } catch {
    return null;
  }
}

export function writeCurrentMealPlan(plan) {
  window.localStorage.setItem(
    `mealMindCurrentMealPlan:${getUserKey()}`,
    JSON.stringify(plan)
  );
  const history = readMealPlanHistory();
  const planId = plan.id || plan.planId;
  const next = [plan, ...history.filter(item => item.id !== planId)];
  window.localStorage.setItem(
    `mealMindSavedMealPlans:${getUserKey()}`,
    JSON.stringify(next)
  );
}

export function removeMealPlanFromStorage(id) {
  const key = getUserKey();
  const history = readList(`mealMindSavedMealPlans:${key}`).filter(plan => plan.id !== id);
  window.localStorage.setItem(`mealMindSavedMealPlans:${key}`, JSON.stringify(history));
  const current = readCurrentMealPlan();
  if (current?.id === id || current?.planId === id) {
    window.localStorage.removeItem(`mealMindCurrentMealPlan:${key}`);
  }
  return history;
}
