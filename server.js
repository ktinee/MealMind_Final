const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { createHash, randomBytes, randomUUID } = require('crypto');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(
  process.env.MEALMIND_DB_PATH || path.join(__dirname, 'mealmind.db'),
  (err) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.log('Connected to the mealmind.db database.');
    }
  },
);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
}

async function initializeDatabase() {
  await run('PRAGMA foreign_keys = ON');

  await run(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    name TEXT
  )
  `);

  const columns = await all('PRAGMA table_info(users)');
  const columnNames = columns.map((column) => column.name);
  if (!columnNames.includes('name')) {
    await run('ALTER TABLE users ADD COLUMN name TEXT');
  }

  if (columnNames.includes('email')) {
    await run('BEGIN TRANSACTION');
    try {
      await run(`
        CREATE TABLE users_without_email (
          user_id TEXT PRIMARY KEY,
          username TEXT UNIQUE,
          password TEXT,
          name TEXT
        )
      `);
      await run(`
        INSERT INTO users_without_email (user_id, username, password, name)
        SELECT user_id, username, password, name FROM users
      `);
      await run('DROP TABLE users');
      await run('ALTER TABLE users_without_email RENAME TO users');
      await run('COMMIT');
    } catch (error) {
      try {
        await run('ROLLBACK');
      } catch (rollbackError) {
        console.error('Failed to roll back the email schema migration:', rollbackError.message);
      }
      throw error;
    }
  }

  await run(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS meal_plans (
      plan_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      planner_json TEXT NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, plan_id)
    )
  `);
  await run(`
    CREATE INDEX IF NOT EXISTS meal_plans_by_user
    ON meal_plans (user_id, updated_at DESC)
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS user_recipes (
      recipe_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      plan_id TEXT NOT NULL,
      date_key TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      recipe_name TEXT NOT NULL,
      ingredients_json TEXT NOT NULL,
      steps_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (user_id, plan_id, date_key, meal_type),
      FOREIGN KEY (user_id, plan_id)
        REFERENCES meal_plans(user_id, plan_id) ON DELETE CASCADE
    )
  `);
  await run(`
    CREATE INDEX IF NOT EXISTS user_recipes_by_user
    ON user_recipes (user_id, updated_at DESC)
  `);
}

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}


function getCustomRecipes(planner) {
  const mealPlan = planner.mealPlan;
  if (!mealPlan || typeof mealPlan !== 'object' || Array.isArray(mealPlan)) {
    return { recipes: [], error: null };
  }

  const recipes = [];
  for (const [dateKey, meals] of Object.entries(mealPlan)) {
    if (!meals || typeof meals !== 'object' || Array.isArray(meals)) continue;

    for (const [mealType, meal] of Object.entries(meals)) {
      if (!meal || typeof meal !== 'object' || Array.isArray(meal)) continue;
      const hasIngredients = Object.prototype.hasOwnProperty.call(meal, 'customIngredients');
      const hasSteps = Object.prototype.hasOwnProperty.call(meal, 'customSteps');
      if (!hasIngredients && !hasSteps) continue;

      const ingredients = Array.isArray(meal.customIngredients)
        ? meal.customIngredients.map((item) => typeof item === 'string' ? item.trim() : '')
          .filter(Boolean)
        : [];
      const steps = Array.isArray(meal.customSteps)
        ? meal.customSteps.map((item) => typeof item === 'string' ? item.trim() : '')
          .filter(Boolean)
        : [];
      if (
        typeof meal.name !== 'string' ||
        !meal.name.trim() ||
        !ingredients.length ||
        !steps.length
      ) {
        return {
          recipes: [],
          error: 'Each custom recipe needs a name, at least one ingredient, and one cooking step.',
        };
      }

      recipes.push({
        dateKey,
        mealType,
        name: meal.name.trim(),
        ingredients,
        steps,
      });
    }
  }

  return { recipes, error: null };
}

function requireSession(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer ([a-f0-9]{64})$/i);
  if (!match) {
    return res.status(401).json({ error: 'Please log in to continue.' });
  }

  const tokenHash = hashSessionToken(match[1]);
  db.get(
    `SELECT user_id, expires_at FROM auth_sessions
     WHERE token_hash = ?`,
    [tokenHash],
    (error, session) => {
      if (error) {
        console.error('Error validating session:', error.message);
        return res.status(500).json({ error: 'Unable to validate your session.' });
      }
      if (!session || Date.parse(session.expires_at) <= Date.now()) {
        if (session) {
          db.run('DELETE FROM auth_sessions WHERE token_hash = ?', [tokenHash]);
        }
        return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
      }

      req.userId = session.user_id;
      next();
    },
  );
}

app.post('/api/signup', async (req, res) => {
  const { username, name, password } = req.body || {};
  const normalizedUsername = typeof username === 'string' ? username.trim() : '';
  const displayName = typeof name === 'string'
    ? name.trim()
    : normalizedUsername;

  if (!displayName || !normalizedUsername || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    await run(
      `INSERT INTO users (user_id, username, password, name)
       VALUES (?, ?, ?, ?)`,
      [userId, normalizedUsername, hashedPassword, displayName],
    );
    res.status(201).json({
      userId,
      name: displayName,
      username: normalizedUsername,
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'An account with that username already exists.' });
    }
    console.error('Error creating account:', error.message);
    res.status(500).json({ error: 'Unable to create your account.' });
  }
});

app.get('/', (req, res) => {
  res.status(200).send('MealMind API is running.');
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username.trim()], async (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Server error during login.' });
    }
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    try {
      const sessionToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await run(
        'INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
        [hashSessionToken(sessionToken), user.user_id, expiresAt],
      );
      res.status(200).json({
        userId: user.user_id,
        username: user.username,
        sessionToken,
      });
    } catch (error) {
      console.error('Error creating login session:', error.message);
      res.status(500).json({ error: 'Unable to log in right now.' });
    }
  });
});

app.get('/api/meal-plans', requireSession, async (req, res) => {
  try {
    const rows = await all(
      `SELECT plan_id, planner_json, is_current, created_at, updated_at
       FROM meal_plans WHERE user_id = ? ORDER BY updated_at DESC`,
      [req.userId],
    );
    res.json(rows.map((row) => ({
      ...JSON.parse(row.planner_json),
      id: row.plan_id,
      isCurrent: Boolean(row.is_current),
      savedAt: row.created_at,
      updatedAt: row.updated_at,
    })));
  } catch (error) {
    console.error('Error loading meal plans:', error.message);
    res.status(500).json({ error: 'Unable to load your meal plans.' });
  }
});

app.get('/api/recipes', requireSession, async (req, res) => {
  try {
    const rows = await all(
      `SELECT recipe_id, plan_id, date_key, meal_type, recipe_name,
              ingredients_json, steps_json, created_at, updated_at
       FROM user_recipes WHERE user_id = ? ORDER BY updated_at DESC`,
      [req.userId],
    );
    res.json(rows.map((row) => ({
      id: row.recipe_id,
      planId: row.plan_id,
      dateKey: row.date_key,
      mealType: row.meal_type,
      name: row.recipe_name,
      ingredients: JSON.parse(row.ingredients_json),
      steps: JSON.parse(row.steps_json),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })));
  } catch (error) {
    console.error('Error loading recipes:', error.message);
    res.status(500).json({ error: 'Unable to load your recipes.' });
  }
});

app.get('/api/meal-stats/most-generated', requireSession, async (req, res) => {
  try {
    const rows = await all(
      'SELECT planner_json FROM meal_plans WHERE user_id = ?',
      [req.userId],
    );
    const counts = new Map();

    for (const row of rows) {
      let planner;
      try {
        planner = JSON.parse(row.planner_json);
      } catch {
        continue;
      }

      const mealPlan = planner?.mealPlan;
      if (!mealPlan || typeof mealPlan !== 'object' || Array.isArray(mealPlan)) continue;

      for (const day of Object.values(mealPlan)) {
        if (!day || typeof day !== 'object' || Array.isArray(day)) continue;
        for (const [category, meal] of Object.entries(day)) {
          if (typeof meal?.name !== 'string' || !meal.name.trim()) continue;
          const key = `${category}\0${meal.name.trim()}`;
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
    }

    const meals = [...counts.entries()]
      .map(([key, count]) => {
        const [category, name] = key.split('\0');
        return { category, name, count };
      })
      .sort((first, second) =>
        second.count - first.count ||
        first.category.localeCompare(second.category) ||
        first.name.localeCompare(second.name)
      );
    res.json(meals);
  } catch (error) {
    console.error('Error loading meal statistics:', error.message);
    res.status(500).json({ error: 'Unable to load meal statistics.' });
  }
});

app.post('/api/meal-plans', requireSession, async (req, res) => {
  const { id, planner, isCurrent = true } = req.body || {};
  if (
    typeof id !== 'string' ||
    !id.trim() ||
    id.length > 128 ||
    !planner ||
    typeof planner !== 'object' ||
    Array.isArray(planner) ||
    typeof isCurrent !== 'boolean'
  ) {
    return res.status(400).json({ error: 'A valid meal plan is required.' });
  }

  const { recipes, error: recipeError } = getCustomRecipes(planner);
  if (recipeError) {
    return res.status(400).json({ error: recipeError });
  }

  const now = new Date().toISOString();
  let transactionStarted = false;
  try {
    await run('BEGIN TRANSACTION');
    transactionStarted = true;
    if (isCurrent) {
      await run('UPDATE meal_plans SET is_current = 0 WHERE user_id = ?', [req.userId]);
    }
    await run(
      `INSERT INTO meal_plans
        (plan_id, user_id, planner_json, is_current, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, plan_id) DO UPDATE SET
         planner_json = excluded.planner_json,
         is_current = excluded.is_current,
         updated_at = excluded.updated_at`,
      [id, req.userId, JSON.stringify(planner), isCurrent ? 1 : 0, now, now],
    );
    await run(
      'DELETE FROM user_recipes WHERE user_id = ? AND plan_id = ?',
      [req.userId, id],
    );
    for (const recipe of recipes) {
      await run(
        `INSERT INTO user_recipes
          (recipe_id, user_id, plan_id, date_key, meal_type, recipe_name,
           ingredients_json, steps_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          req.userId,
          id,
          recipe.dateKey,
          recipe.mealType,
          recipe.name,
          JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.steps),
          now,
          now,
        ],
      );
    }
    await run('COMMIT');
    transactionStarted = false;
    res.status(200).json({ id, isCurrent });
  } catch (error) {
    if (transactionStarted) {
      try {
        await run('ROLLBACK');
      } catch (rollbackError) {
        console.error('Failed to roll back meal plan save:', rollbackError.message);
      }
    }
    console.error('Error saving meal plan:', error.message);
    res.status(500).json({ error: 'Unable to save your meal plan.' });
  }
});

app.delete('/api/meal-plans', requireSession, async (req, res) => {
  try {
    await run('DELETE FROM meal_plans WHERE user_id = ?', [req.userId]);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting meal plans:', error.message);
    res.status(500).json({ error: 'Unable to delete your meal plans.' });
  }
});

app.delete('/api/meal-plans/:id', requireSession, async (req, res) => {
  try {
    await run(
      'DELETE FROM meal_plans WHERE user_id = ? AND plan_id = ?',
      [req.userId, req.params.id],
    );
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting meal plan:', error.message);
    res.status(500).json({ error: 'Unable to delete your meal plan.' });
  }
});

app.get('/api/users01', (req, res) => {
  db.all('SELECT username FROM users', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error.');
    }

    res.status(200).json(rows);
  });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize the database:', error.message);
    db.close(() => process.exit(1));
  });
