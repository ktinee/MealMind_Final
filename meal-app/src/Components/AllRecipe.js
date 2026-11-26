
const CALORIES_BY_MEAL = {
  Breakfast: {
    "Tapsilog": 650,
    "Tocilog": 600,
    "Longsilog": 620,
    "Corned Beef Silog": 580,
    "Hotdog Silog": 550,
    "Tortang Talong": 250,
    "Pandesal with Egg": 280,
    "Arroz Caldo": 300,
    "Champorado": 350,
    "Pancakes": 350,
    "Lugaw": 180,
    "Egg Sandwich": 300,
    "Garlic Fried Rice with Egg": 400,
    "Puto and Boiled Egg": 250,
    "Banana Cue": 250,
    "Pandesal with Peanut Butter": 280,
    "Ginisang Sardinas with Rice": 400,
    "Omelette with Tomato": 220,
    "Sweet Potato and Egg": 280,
    "Pancit Canton with Egg": 400
  },

  Lunch: {
    "Chicken Adobo": 450,
    "Pork Adobo": 550,
    "Sinigang na Baboy": 450,
    "Tinolang Manok": 350,
    "Pork Menudo": 450,
    "Chicken Afritada": 450,
    "Pork Sinigang": 450,
    "Ginisang Monggo": 300,
    "Pork Giniling": 450,
    "Bicol Express": 550,
    "Pork Sisig": 550,
    "Paksiw na Isda": 300,
    "Fried Fish with Rice": 450,
    "Chicken Curry": 500,
    "Pork Nilaga": 400,
    "Chopsuey": 200,
    "Pinakbet": 200,
    "Pork BBQ with Rice": 500,
    "Beef Mechado": 500,
    "Tortang Giniling": 400
  },

  Snack: {
    "Banana Cue": 250,
    "Turon": 200,
    "Maruya": 220,
    "Pancit Canton Snack": 300,
    "Puto": 150,
    "Kutsinta": 120,
    "Palitaw": 180,
    "Kamote Cue": 250,
    "Ginataang Bilo-Bilo": 350,
    "Mais con Yelo": 250,
    "Halo-Halo": 400,
    "Fish Balls": 200,
    "Kwek-Kwek": 250,
    "Lumpiang Gulay": 180,
    "Camote Fries": 250,
    "Banana Fritters": 220,
    "Boiled Corn": 150,
    "Pandesal Pizza": 280,
    "Cheese Sandwich": 300,
    "Fruit Salad": 300
  },

  Dinner: {
    "Fried Chicken": 400,
    "Chicken Tinola": 300,
    "Pork Sinigang": 350,
    "Ginisang Sayote": 180,
    "Pork Paksiw": 450,
    "Beef Nilaga": 400,
    "Tortang Talong": 220,
    "Ginisang Pechay": 120,
    "Pork BBQ": 350,
    "Chicken Afritada": 350,
    "Ginisang Togue": 180,
    "Sardinas with Misua": 250,
    "Pork Giniling": 350,
    "Grilled Fish": 250,
    "Ginisang Ampalaya": 180,
    "Pork Menudo": 400,
    "Chicken Curry": 400,
    "Pinakbet": 180,
    "Pancit Bihon": 350,
    "Tofu and Vegetable Stir Fry": 250
  }
};

const RECIPES_BY_CATEGORY = {
  Breakfast: [
    ["Tapsilog", 85, ["Beef tapa", "Rice", "Egg", "Garlic", "Cooking oil"], ["Marinate the beef with soy sauce, garlic, and calamansi.", "Pan-fry the beef until cooked and prepare the egg.", "Serve with garlic fried rice."]],
    ["Tocilog", 65, ["Pork tocino", "Rice", "Egg", "Cooking oil"], ["Place the tocino in a pan with a little water.", "Cook until the water evaporates and the tocino is caramelized.", "Serve with fried rice and egg."]],
    ["Longsilog", 60, ["Longganisa", "Rice", "Egg", "Garlic", "Cooking oil"], ["Cook the longganisa in a pan with a little water.", "Allow the water to evaporate, then cook until browned.", "Serve with garlic rice and fried egg."]],
    ["Corned Beef Silog", 55, ["Corned beef", "Rice", "Egg", "Onion", "Garlic"], ["Sauté garlic and onion in a little oil.", "Add corned beef and cook until heated through.", "Serve with fried rice and egg."]],
    ["Hotdog Silog", 45, ["Hotdog", "Rice", "Egg", "Cooking oil"], ["Slice the hotdog if desired.", "Pan-fry until heated through and lightly browned.", "Serve with rice and fried egg."]],
    ["Tortang Talong", 45, ["Eggplant", "Egg", "Garlic", "Salt", "Cooking oil"], ["Grill or boil the eggplant until tender, peel, and flatten.", "Dip in beaten egg seasoned with salt.", "Pan-fry both sides until golden."]],
    ["Pandesal with Egg", 35, ["Pandesal", "Egg", "Cooking oil", "Salt"], ["Heat a pan with a little oil.", "Fry and lightly season the egg.", "Serve inside warm pandesal."]],
    ["Arroz Caldo", 55, ["Rice", "Chicken", "Ginger", "Garlic", "Onion", "Fish sauce"], ["Sauté garlic, onion, and ginger, then add chicken.", "Add rice and water and simmer until thick.", "Season with fish sauce and serve hot."]],
    ["Champorado", 40, ["Glutinous rice", "Tablea chocolate", "Sugar", "Water", "Evaporated milk"], ["Boil glutinous rice in water until soft.", "Add tablea and sugar, stirring until dissolved.", "Serve warm with milk."]],
    ["Pancakes", 45, ["Flour", "Egg", "Milk", "Sugar", "Baking powder"], ["Mix the ingredients into a smooth batter.", "Pour batter into a lightly oiled pan.", "Flip when bubbles appear and cook the other side."]],
    ["Lugaw", 30, ["Rice", "Garlic", "Ginger", "Onion", "Fish sauce"], ["Sauté garlic, onion, and ginger.", "Add rice and water, then simmer until soft.", "Season with fish sauce and serve warm."]],
    ["Egg Sandwich", 35, ["Bread", "Egg", "Mayonnaise", "Salt", "Pepper"], ["Boil the egg until cooked, then peel and mash.", "Mix with mayonnaise, salt, and pepper.", "Spread the mixture on bread."]],
    ["Garlic Fried Rice with Egg", 35, ["Rice", "Egg", "Garlic", "Cooking oil", "Salt"], ["Sauté minced garlic in oil until fragrant.", "Add rice and stir-fry until heated through.", "Serve with a fried egg."]],
    ["Puto and Boiled Egg", 35, ["Puto", "Egg", "Water"], ["Boil eggs until fully cooked.", "Prepare or steam the puto until warm.", "Serve together."]],
    ["Banana Cue", 30, ["Saba banana", "Brown sugar", "Cooking oil"], ["Heat oil in a pan.", "Fry saba bananas until lightly browned, then add brown sugar.", "Turn until coated and caramelized."]],
    ["Pandesal with Peanut Butter", 25, ["Pandesal", "Peanut butter"], ["Warm the pandesal if desired.", "Slice each pandesal open.", "Spread with peanut butter and serve."]],
    ["Ginisang Sardinas with Rice", 40, ["Canned sardines", "Tomato", "Onion", "Garlic", "Rice"], ["Sauté garlic, onion, and tomato.", "Add sardines and simmer for several minutes.", "Serve hot with rice."]],
    ["Omelette with Tomato", 40, ["Egg", "Tomato", "Onion", "Salt", "Cooking oil"], ["Beat eggs with chopped tomato, onion, and salt.", "Pour into a lightly oiled pan.", "Cook until set, fold, and serve."]],
    ["Sweet Potato and Egg", 35, ["Sweet potato", "Egg", "Salt", "Cooking oil"], ["Wash, peel, and slice the sweet potato.", "Boil or pan-cook until tender and prepare a fried egg.", "Serve together."]],
    ["Pancit Canton with Egg", 45, ["Pancit canton noodles", "Egg", "Cabbage", "Carrot", "Garlic"], ["Sauté garlic and vegetables.", "Add noodles and water and cook until tender.", "Top with a cooked egg and serve."]]
  ],
  Lunch: [
    ["Chicken Adobo", 85, ["Chicken", "Soy sauce", "Vinegar", "Garlic", "Bay leaves", "Rice"], ["Combine chicken, soy sauce, vinegar, garlic, and bay leaves.", "Bring to a boil, then simmer until chicken is fully cooked.", "Adjust the sauce and serve with rice."]],
    ["Pork Adobo", 90, ["Pork", "Soy sauce", "Vinegar", "Garlic", "Bay leaves", "Rice"], ["Combine pork, soy sauce, vinegar, garlic, and bay leaves.", "Simmer until pork is tender and fully cooked.", "Reduce the sauce and serve with rice."]],
    ["Sinigang na Baboy", 100, ["Pork", "Sinigang mix", "Kangkong", "Radish", "Tomato", "Rice"], ["Boil pork in water until tender.", "Add tomato, radish, and sinigang mix.", "Add kangkong near the end and serve with rice."]],
    ["Tinolang Manok", 85, ["Chicken", "Papaya", "Malunggay", "Ginger", "Onion", "Rice"], ["Sauté ginger and onion, then add chicken.", "Add water and simmer until chicken is cooked.", "Add papaya and malunggay, cook until tender, and serve."]],
    ["Pork Menudo", 95, ["Pork", "Liver", "Potato", "Carrot", "Tomato sauce", "Rice"], ["Sauté garlic and onion, then cook pork and liver.", "Add tomato sauce, water, potato, and carrot.", "Simmer until tender and fully cooked."]],
    ["Chicken Afritada", 90, ["Chicken", "Tomato sauce", "Potato", "Carrot", "Bell pepper", "Rice"], ["Sauté garlic and onion, then brown the chicken.", "Add tomato sauce, water, potatoes, and carrots.", "Simmer until cooked, add bell pepper, and serve."]],
    ["Pork Sinigang", 100, ["Pork", "Sinigang mix", "Tomato", "Radish", "Kangkong", "Rice"], ["Boil pork with tomato until tender.", "Add sinigang mix and radish, then simmer.", "Add kangkong before turning off the heat."]],
    ["Ginisang Monggo", 55, ["Mung beans", "Malunggay", "Tomato", "Garlic", "Onion", "Rice"], ["Boil mung beans until tender.", "Sauté garlic, onion, and tomato, then add the beans.", "Add malunggay, simmer, and serve with rice."]],
    ["Pork Giniling", 80, ["Ground pork", "Potato", "Carrot", "Tomato sauce", "Garlic", "Rice"], ["Sauté garlic and onion, then add ground pork.", "Add tomato sauce, potato, carrot, and water.", "Simmer until pork and vegetables are cooked."]],
    ["Bicol Express", 90, ["Pork", "Coconut milk", "Chili", "Shrimp paste", "Garlic", "Rice"], ["Sauté garlic and pork until browned.", "Add coconut milk, chili, and shrimp paste.", "Simmer until pork is tender and serve with rice."]],
    ["Pork Sisig", 90, ["Pork", "Onion", "Calamansi", "Chili", "Egg", "Rice"], ["Cook the pork until tender, then chop.", "Sauté with onion, calamansi, and chili.", "Serve hot, optionally topped with egg."]],
    ["Paksiw na Isda", 75, ["Fish", "Vinegar", "Ginger", "Garlic", "Eggplant"], ["Arrange fish with vinegar, ginger, garlic, and water in a pot.", "Bring to a boil, then simmer until the fish is cooked.", "Add eggplant and cook until tender."]],
    ["Fried Fish with Rice", 75, ["Fish", "Rice", "Salt", "Pepper", "Cooking oil"], ["Clean and season the fish with salt and pepper.", "Pan-fry until golden and cooked through.", "Serve with rice."]],
    ["Chicken Curry", 95, ["Chicken", "Coconut milk", "Curry powder", "Potato", "Carrot", "Rice"], ["Sauté garlic and onion, then add chicken and curry powder.", "Add coconut milk, potato, and carrot.", "Simmer until chicken is cooked and vegetables are tender."]],
    ["Pork Nilaga", 95, ["Pork", "Potato", "Cabbage", "Pechay", "Onion", "Peppercorn"], ["Boil pork with onion and peppercorn until tender.", "Add potato and cook until nearly tender.", "Add cabbage and pechay, then simmer until cooked."]],
    ["Chopsuey", 75, ["Cabbage", "Carrot", "Cauliflower", "Sayote", "Garlic", "Oyster sauce"], ["Wash and cut vegetables into bite-sized pieces.", "Sauté garlic and add the firm vegetables first.", "Add remaining vegetables and oyster sauce, then cook until tender-crisp."]],
    ["Pinakbet", 65, ["Squash", "Eggplant", "Okra", "Sitaw", "Tomato", "Shrimp paste"], ["Sauté garlic, onion, and tomato.", "Add squash and a little water, then cook until partly tender.", "Add remaining vegetables and shrimp paste, then simmer."]],
    ["Pork BBQ with Rice", 85, ["Pork", "Soy sauce", "Calamansi", "Garlic", "Brown sugar", "Rice"], ["Marinate pork in soy sauce, calamansi, garlic, and brown sugar.", "Thread onto skewers and grill until fully cooked.", "Serve with rice."]],
    ["Beef Mechado", 120, ["Beef", "Tomato sauce", "Potato", "Carrot", "Garlic", "Rice"], ["Sauté garlic and onion, then brown the beef.", "Add tomato sauce and water, then simmer until tender.", "Add potato and carrot and cook until soft."]],
    ["Tortang Giniling", 65, ["Ground pork", "Egg", "Carrot", "Onion", "Garlic", "Rice"], ["Sauté ground pork with garlic, onion, and carrot until cooked.", "Mix the cooled filling with beaten eggs.", "Pan-fry portions until firm and cooked through."]]
  ],
  Snack: [
    ["Banana Cue", 25, ["Saba banana", "Brown sugar", "Cooking oil"], ["Heat oil in a pan.", "Fry saba bananas until lightly browned, then add brown sugar.", "Turn until coated and caramelized."]],
    ["Turon", 25, ["Saba banana", "Lumpia wrapper", "Brown sugar", "Cooking oil"], ["Slice saba bananas and coat lightly with brown sugar.", "Wrap in lumpia wrappers and seal the edges.", "Fry until golden and crispy."]],
    ["Maruya", 25, ["Saba banana", "Flour", "Egg", "Sugar", "Cooking oil"], ["Slice bananas and mix with flour, egg, and a little water.", "Spoon the mixture into a lightly oiled pan.", "Cook both sides until golden."]],
    ["Pancit Canton Snack", 30, ["Pancit canton noodles", "Cabbage", "Carrot", "Garlic"], ["Sauté garlic and vegetables.", "Add noodles and water according to package directions.", "Cook until tender and serve."]],
    ["Puto", 20, ["Rice flour", "Sugar", "Milk", "Baking powder"], ["Mix rice flour, sugar, milk, and baking powder.", "Pour batter into small molds.", "Steam until firm and cooked through."]],
    ["Kutsinta", 20, ["Rice flour", "All-purpose flour", "Brown sugar", "Lye water"], ["Mix flours, sugar, water, and a small amount of lye water.", "Pour into lightly greased molds.", "Steam until firm and serve with grated coconut."]],
    ["Palitaw", 25, ["Glutinous rice flour", "Water", "Grated coconut", "Sugar", "Sesame seeds"], ["Mix glutinous rice flour with water to form a soft dough.", "Shape into flat pieces and boil until they float.", "Coat with coconut, sugar, and sesame seeds."]],
    ["Kamote Cue", 25, ["Sweet potato", "Brown sugar", "Cooking oil"], ["Peel and slice the sweet potatoes.", "Fry until tender, then add brown sugar.", "Turn until coated and serve."]],
    ["Ginataang Bilo-Bilo", 45, ["Glutinous rice balls", "Coconut milk", "Saba banana", "Sweet potato", "Tapioca pearls", "Sugar"], ["Boil sweet potato and tapioca pearls until partly cooked.", "Add coconut milk, rice balls, and sliced banana.", "Simmer until rice balls are cooked and the mixture thickens."]],
    ["Mais con Yelo", 30, ["Sweet corn", "Crushed ice", "Evaporated milk", "Sugar"], ["Prepare sweet corn and let it cool.", "Place crushed ice and corn in a glass.", "Add milk and sugar, then mix before serving."]],
    ["Halo-Halo", 55, ["Shaved ice", "Evaporated milk", "Sweet beans", "Banana", "Nata de coco", "Ube"], ["Place sweet beans, banana, and nata de coco in a glass.", "Fill with shaved ice and pour evaporated milk over it.", "Add ube and mix before eating."]],
    ["Fish Balls", 25, ["Fish balls", "Cooking oil", "Sweet sauce", "Vinegar", "Onion"], ["Heat oil in a pan.", "Fry fish balls until heated through and golden.", "Serve with sweet sauce or vinegar dip."]],
    ["Kwek-Kwek", 30, ["Quail eggs", "Flour", "Cornstarch", "Annatto powder", "Cooking oil"], ["Boil and peel the quail eggs.", "Prepare a batter with flour, cornstarch, water, and annatto.", "Coat the eggs and fry until crisp and cooked."]],
    ["Lumpiang Gulay", 30, ["Lumpia wrapper", "Cabbage", "Carrot", "Bean sprouts", "Garlic"], ["Sauté garlic and vegetables until just tender.", "Place filling in wrappers and roll tightly.", "Fry until golden and serve with dipping sauce."]],
    ["Camote Fries", 25, ["Sweet potato", "Cornstarch", "Salt", "Cooking oil"], ["Peel and cut sweet potato into strips.", "Coat lightly with cornstarch and salt.", "Fry until golden and tender."]],
    ["Banana Fritters", 25, ["Saba banana", "Flour", "Sugar", "Water", "Cooking oil"], ["Mix flour, sugar, and water to make a batter.", "Dip banana slices in the batter.", "Fry until golden and cooked through."]],
    ["Boiled Corn", 20, ["Sweet corn", "Water", "Salt"], ["Remove the husk and wash the corn.", "Boil in water until the kernels are tender.", "Drain and serve with a little salt."]],
    ["Pandesal Pizza", 35, ["Pandesal", "Tomato sauce", "Cheese", "Hotdog", "Onion"], ["Slice pandesal and spread tomato sauce on top.", "Add chopped hotdog, onion, and cheese.", "Bake or toast until the cheese melts."]],
    ["Cheese Sandwich", 30, ["Bread", "Cheese", "Butter"], ["Spread butter on the bread.", "Place cheese between two slices.", "Toast in a pan until golden and the cheese melts."]],
    ["Fruit Salad", 45, ["Fruit cocktail", "All-purpose cream", "Condensed milk", "Nata de coco"], ["Drain the fruit cocktail and nata de coco.", "Mix with cream and condensed milk.", "Chill before serving."]]
  ],
  Dinner: [
    ["Fried Chicken", 85, ["Chicken", "Flour", "Garlic powder", "Salt", "Pepper", "Cooking oil"], ["Season chicken and coat with seasoned flour.", "Fry until golden and fully cooked.", "Drain excess oil and serve."]],
    ["Chicken Tinola", 85, ["Chicken", "Ginger", "Sayote", "Malunggay", "Garlic", "Onion"], ["Sauté garlic, onion, and ginger, then add chicken.", "Add water and simmer until chicken is fully cooked.", "Add sayote and malunggay, then cook until tender."]],
    ["Pork Sinigang", 100, ["Pork", "Sinigang mix", "Kangkong", "Radish", "Tomato"], ["Boil pork with tomato until tender.", "Add radish and sinigang mix, then simmer.", "Add kangkong near the end and serve."]],
    ["Ginisang Sayote", 45, ["Sayote", "Garlic", "Onion", "Tomato", "Ground pork"], ["Peel and slice the sayote.", "Sauté garlic, onion, tomato, and ground pork until cooked.", "Add sayote and a little water, then cook until tender."]],
    ["Pork Paksiw", 85, ["Pork", "Vinegar", "Garlic", "Peppercorn", "Bay leaves", "Banana"], ["Place pork, vinegar, garlic, peppercorn, and bay leaves in a pot.", "Simmer until pork is tender and fully cooked.", "Add banana and cook until soft."]],
    ["Beef Nilaga", 120, ["Beef", "Potato", "Cabbage", "Pechay", "Onion", "Peppercorn"], ["Boil beef with onion and peppercorn until tender.", "Add potatoes and cook until nearly soft.", "Add cabbage and pechay, then simmer until cooked."]],
    ["Tortang Talong", 45, ["Eggplant", "Egg", "Salt", "Pepper", "Cooking oil"], ["Grill or boil eggplant until tender, then peel and flatten.", "Dip in beaten egg seasoned with salt and pepper.", "Pan-fry both sides until golden."]],
    ["Ginisang Pechay", 40, ["Pechay", "Garlic", "Onion", "Tomato", "Oyster sauce"], ["Wash and cut the pechay.", "Sauté garlic, onion, and tomato.", "Add pechay and oyster sauce, then cook until tender."]],
    ["Pork BBQ", 85, ["Pork", "Soy sauce", "Calamansi", "Garlic", "Brown sugar"], ["Marinate pork with soy sauce, calamansi, garlic, and brown sugar.", "Thread onto skewers.", "Grill while turning until fully cooked."]],
    ["Chicken Afritada", 90, ["Chicken", "Tomato sauce", "Potato", "Carrot", "Bell pepper"], ["Sauté garlic and onion, then brown the chicken.", "Add tomato sauce, water, potato, and carrot.", "Simmer until fully cooked and add bell pepper."]],
    ["Ginisang Togue", 40, ["Bean sprouts", "Carrot", "Tofu", "Garlic", "Onion"], ["Wash bean sprouts and slice the vegetables.", "Sauté garlic and onion, then add tofu and carrot.", "Add bean sprouts and cook briefly until tender-crisp."]],
    ["Sardinas with Misua", 45, ["Canned sardines", "Misua", "Garlic", "Onion", "Patola"], ["Sauté garlic and onion.", "Add sardines, water, and sliced patola, then simmer.", "Add misua and cook until soft."]],
    ["Pork Giniling", 80, ["Ground pork", "Potato", "Carrot", "Tomato sauce", "Garlic", "Onion"], ["Sauté garlic and onion, then add ground pork.", "Add tomato sauce, potato, carrot, and water.", "Simmer until pork and vegetables are fully cooked."]],
    ["Grilled Fish", 75, ["Fish", "Calamansi", "Salt", "Pepper", "Cooking oil"], ["Clean fish and season with calamansi, salt, and pepper.", "Grill, turning carefully, until fully cooked.", "Serve with a dipping sauce."]],
    ["Ginisang Ampalaya", 45, ["Ampalaya", "Egg", "Tomato", "Onion", "Garlic"], ["Slice ampalaya, soak briefly in salted water, then drain.", "Sauté garlic, onion, and tomato, then add ampalaya.", "Add beaten egg and cook until set."]],
    ["Pork Menudo", 95, ["Pork", "Potato", "Carrot", "Tomato sauce", "Garlic", "Onion"], ["Sauté garlic and onion, then cook pork until browned.", "Add tomato sauce, water, potato, and carrot.", "Simmer until pork is tender and vegetables are cooked."]],
    ["Chicken Curry", 95, ["Chicken", "Coconut milk", "Curry powder", "Potato", "Carrot"], ["Sauté garlic and onion, then add chicken and curry powder.", "Pour in coconut milk and add potato and carrot.", "Simmer until chicken is fully cooked and vegetables are tender."]],
    ["Pinakbet", 65, ["Squash", "Eggplant", "Okra", "Sitaw", "Shrimp paste"], ["Sauté garlic, onion, and tomato.", "Add squash and a little water, then cook until partly tender.", "Add remaining vegetables and shrimp paste, then simmer."]],
    ["Pancit Bihon", 65, ["Bihon noodles", "Chicken", "Cabbage", "Carrot", "Soy sauce", "Garlic"], ["Sauté garlic and onion, then add chicken and cook thoroughly.", "Add vegetables, soy sauce, and water or broth.", "Add bihon and cook until noodles absorb the liquid."]],
    ["Tofu and Vegetable Stir Fry", 55, ["Tofu", "Cabbage", "Carrot", "Garlic", "Soy sauce"], ["Cut tofu into cubes and brown in a lightly oiled pan.", "Sauté garlic and vegetables until tender-crisp.", "Return tofu, add soy sauce, toss, and serve."]]
  ]
};

const ALL_RECIPES = Object.fromEntries(
  Object.entries(RECIPES_BY_CATEGORY).flatMap(([type, recipes]) =>
    recipes.map(([name, price, ingredients, process]) => [
      `${type}:${name}`,
      { name, type, price, ingredients, process }
    ])
  )
);

Object.entries(CALORIES_BY_MEAL).forEach(([type, meals]) => {
  Object.keys(meals).forEach(name => {
    if (!ALL_RECIPES[`${type}:${name}`]) {
      throw new Error(`Missing ${type} recipe data for "${name}".`);
    }
  });
});

export const MAIN_INGREDIENT_CATEGORIES = [
  "Chicken",
  "Beef",
  "Pork",
  "Fish",
  "Vegetable"
];

const MAIN_INGREDIENT_MATCHERS = [
  {
    category: "Chicken",
    pattern: /\b(chicken|manok)\b/
  },
  {
    category: "Beef",
    pattern: /\b(beef|baka)\b/
  },
  {
    category: "Pork",
    pattern: /\b(pork|baboy|ham|bacon|longganisa|tocino)\b/
  },
  {
    category: "Fish",
    pattern: /\b(fish|bangus|tilapia|tuna|sardines?|salmon|dilis|galunggong|shrimp|seafood)\b/
  }
];

const VEGETABLE_PATTERN = /\b(vegetable|gulay|kangkong|pechay|sayote|kalabasa|squash|talong|eggplant|ampalaya|repolyo|cabbage|carrot|potato|sitaw|malunggay|mongo|munggo|okra|upo|patola|radish|tomato|tofu|bean sprouts|sweet potato)\b/;

const RECIPE_IMAGES_BY_MEAL = {
  Breakfast: [
    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600",
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600"
  ],
  Lunch: [
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600"
  ],
  Snack: [
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
    "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=600"
  ],
  Dinner: [
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=600"
  ]
};

function getRecipeImage(name, mealType) {
  const images = RECIPE_IMAGES_BY_MEAL[mealType];

  if (!images) return "";

  const imageIndex = [...name].reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  ) % images.length;

  return images[imageIndex];
}

export function getMainIngredientCategory(mealName, ingredients = []) {
  const recipeText = `${mealName} ${ingredients.join(" ")}`
    .toLowerCase()
    .replace(/\b(fish sauce|shrimp paste)\b/g, "");

  const proteinCategory = MAIN_INGREDIENT_MATCHERS.find(({ pattern }) =>
    pattern.test(recipeText)
  )?.category;

  if (proteinCategory) return proteinCategory;

  const mainIngredientText = `${mealName} ${ingredients[0] || ""}`
    .toLowerCase();

  return VEGETABLE_PATTERN.test(mainIngredientText)
    ? "Vegetable"
    : "Other";
}

// Add main ingredient, image, and calories to every recipe.
Object.values(ALL_RECIPES).forEach(recipe => {
  const { name } = recipe;
  recipe.mainIngredient = getMainIngredientCategory(
    name,
    recipe.ingredients
  );

  recipe.image = getRecipeImage(name, recipe.type);

  const calories = CALORIES_BY_MEAL[recipe.type]?.[name];
  if (!Number.isFinite(calories)) {
    throw new Error(`Missing calorie data for ${recipe.type} recipe "${name}".`);
  }
  recipe.calories = calories;
});

// Return all recipes grouped by meal category.
export const RECIPES_BY_MEAL = {
  Breakfast: RECIPES_BY_CATEGORY.Breakfast.map(([name]) =>
    ALL_RECIPES[`Breakfast:${name}`]
  ),
  Lunch: RECIPES_BY_CATEGORY.Lunch.map(([name]) =>
    ALL_RECIPES[`Lunch:${name}`]
  ),
  Snack: RECIPES_BY_CATEGORY.Snack.map(([name]) =>
    ALL_RECIPES[`Snack:${name}`]
  ),
  Dinner: RECIPES_BY_CATEGORY.Dinner.map(([name]) =>
    ALL_RECIPES[`Dinner:${name}`]
  )
};

function findRecipe(mealName, mealType) {
  return (
    (mealType ? ALL_RECIPES[`${mealType}:${mealName}`] : null) ||
    Object.values(ALL_RECIPES).find(recipe => recipe.name === mealName)
  );
}

// Get main ingredients of a recipe.
export function getMainIngredients(mealName) {
  const recipe = findRecipe(mealName);

  return recipe ? recipe.ingredients : [];
}

// Get the main ingredient category.
export function getRecipeMainIngredient(mealName) {
  const recipe = findRecipe(mealName);

  return recipe ? recipe.mainIngredient : "Other";
}

// Get recipe calories.
export function getRecipeCalories(mealName, mealType) {
  const recipe = findRecipe(mealName, mealType);

  return (
    recipe?.calories ??
    CALORIES_BY_MEAL[mealType]?.[mealName] ??
    0
  );
}

// Get complete recipe information.
export function getAllRecipe(meal, mealType) {
  const name = meal?.name || "Meal";
  const type = mealType || meal?.type || "";
  const recipe = findRecipe(name, type);
  const resolvedType = type || recipe?.type || "";

  return {
    name,
    mealType: resolvedType,
    estimatedPrice: recipe?.price ?? meal?.price ?? 0,

    calories:
      recipe?.calories ??
      CALORIES_BY_MEAL[resolvedType]?.[name] ??
      meal?.calories ??
      0,

    mainIngredient:
      recipe?.mainIngredient ||
      meal?.mainIngredient ||
      "Other",

    image:
      recipe?.image ||
      meal?.image ||
      "",

    ingredients:
      recipe?.ingredients ||
      meal?.ingredients ||
      [],

    steps:
      recipe?.process ||
      meal?.process ||
      []
  };
}

export { ALL_RECIPES };
export { CALORIES_BY_MEAL };
