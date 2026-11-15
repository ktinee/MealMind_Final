const recipe = (name, calories, estimatedPrice, image, ingredients, process) => ({
  name,
  calories,
  estimatedPrice,
  image,
  ingredients,
  process,
  steps: process
});

export const RECIPES_BY_MEAL = {
  Breakfast: [
    recipe("Avocado Toast", 320, 95, "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600", ["2 slices whole-grain bread", "1 ripe avocado", "1 egg", "Salt and pepper"], ["Toast the bread.", "Mash the avocado and spread it over the toast.", "Top with a cooked egg and season."]),
    recipe("Berry Oatmeal", 280, 70, "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600", ["1/2 cup rolled oats", "1 cup milk", "1/2 cup mixed berries", "1 teaspoon honey"], ["Simmer the oats with milk until soft.", "Top with berries and honey."]),
    recipe("Vegetable Omelet", 290, 85, "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600", ["2 eggs", "1/4 cup chopped vegetables", "1 tablespoon milk"], ["Whisk the eggs and milk.", "Cook with vegetables in a lightly oiled pan."])
  ],
  Lunch: [
    recipe("Chicken Rice Bowl", 480, 160, "https://images.unsplash.com/photo-1547592180-85f173990554?w=600", ["1 cup cooked rice", "120 g chicken breast", "1 cup mixed vegetables"], ["Cook the chicken thoroughly.", "Serve over rice with vegetables."]),
    recipe("Garden Salad", 260, 110, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600", ["2 cups leafy greens", "1 tomato", "1/2 cucumber", "2 tablespoons dressing"], ["Wash and chop the vegetables.", "Toss with dressing and serve."]),
    recipe("Tuna Sandwich", 390, 105, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600", ["2 slices bread", "1 can tuna", "1 tablespoon mayonnaise", "Lettuce"], ["Mix tuna with mayonnaise.", "Layer with lettuce between the bread."])
  ],
  Snack: [
    recipe("Fruit and Yogurt", 190, 65, "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600", ["1 cup plain yogurt", "1/2 cup sliced fruit"], ["Spoon the yogurt into a bowl.", "Top with sliced fruit."]),
    recipe("Peanut Butter Apple", 210, 45, "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600", ["1 apple", "1 tablespoon peanut butter"], ["Slice the apple.", "Serve with peanut butter."])
  ],
  Dinner: [
    recipe("Baked Salmon", 520, 240, "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600", ["150 g salmon fillet", "1 cup broccoli", "1 teaspoon olive oil"], ["Season the salmon and bake until cooked through.", "Steam the broccoli and serve alongside."]),
    recipe("Vegetable Stir-Fry", 380, 125, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600", ["2 cups mixed vegetables", "1 cup cooked rice", "1 tablespoon soy sauce"], ["Stir-fry the vegetables until tender.", "Add soy sauce and serve over rice."]),
    recipe("Turkey Pasta", 490, 175, "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600", ["100 g pasta", "100 g ground turkey", "1/2 cup tomato sauce"], ["Cook pasta according to its package.", "Brown the turkey, stir in sauce, and combine with pasta."])
  ]
};

export default RECIPES_BY_MEAL;
