jest.mock('../Components/mealPlanApi', () => ({
  deleteAllMealPlans: jest.fn(),
  deleteMealPlan: jest.fn(),
  loadMealPlans: jest.fn(),
  loadMostGeneratedMeals: jest.fn(),
  saveMealPlan: jest.fn(),
}));

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toDateInputValue } from '../Components/mealPlanUtils';
import {
  loadMealPlans,
  loadMostGeneratedMeals,
} from '../Components/mealPlanApi';
import Home from './Home';

afterEach(() => {
  window.localStorage.clear();
});

test("refreshes today's meal plan when returning to Home", async () => {
  loadMealPlans.mockResolvedValue([]);
  loadMostGeneratedMeals.mockResolvedValue([]);
  window.localStorage.setItem(
    'mealmind_session',
    JSON.stringify({ userId: 'test-user', username: 'TestUser' })
  );

  const { container } = render(<Home />);

  fireEvent.click(screen.getByRole('button', { name: /Meal Planner/ }));
  await waitFor(() => {
    expect(container.querySelector('.planner-layout')).not.toBeNull();
  });

  const today = toDateInputValue(new Date());
  window.localStorage.setItem(
    'mealMindSavedMealPlans:test-user',
    JSON.stringify([{
      id: 'generated-plan',
      updatedAt: new Date().toISOString(),
      mealPlan: {
        [today]: {
          Breakfast: { name: 'Generated Breakfast', calories: 300, price: 20 },
          Lunch: { name: 'Generated Lunch', calories: 400, price: 30 },
          Dinner: { name: 'Generated Dinner', calories: 500, price: 40 },
          Snack: { name: 'Generated Snack', calories: 200, price: 10 }
        }
      }
    }])
  );

  fireEvent.click(screen.getByRole('button', { name: /Home/ }));

  await waitFor(() => {
    const displayedMeals = Array.from(
      container.querySelectorAll('.daily-card h3')
    ).map(meal => meal.textContent);
    expect(displayedMeals).toEqual([
      'Generated Breakfast',
      'Generated Lunch',
      'Generated Dinner',
      'Generated Snack'
    ]);
  });
});

test("shows the signed-in user's highest meal point count", async () => {
  loadMealPlans.mockResolvedValue([]);
  loadMostGeneratedMeals.mockResolvedValue([
    { name: 'Test Point Meal', category: 'Breakfast', count: 4 },
  ]);
  window.localStorage.setItem(
    'mealmind_session',
    JSON.stringify({ userId: 'test-user', username: 'TestUser' })
  );

  const { container } = render(<Home />);

  await waitFor(() => {
    expect(container.querySelector('.favorite-meal-info h1').textContent)
      .toBe('Test Point Meal');
    const pointText = container
      .querySelector('.favorite-meal-info span')
      .textContent.replace(/\s+/g, ' ')
      .trim();
    expect(pointText).toBe('Breakfast · 4 points');
  });
});

test('automatically adds the most generated meal to Favorites', async () => {
  loadMealPlans.mockResolvedValue([{
    id: 'generated-plan',
    mealPlan: {
      '2026-11-15': {
        Breakfast: {
          name: 'Generated Porridge',
          calories: 300,
          price: 20,
          ingredients: ['Oats'],
          steps: ['Cook the oats'],
        },
      },
    },
  }]);
  loadMostGeneratedMeals.mockResolvedValue([
    { name: 'Generated Porridge', category: 'Breakfast', count: 3 },
  ]);
  window.localStorage.setItem(
    'mealmind_session',
    JSON.stringify({ userId: 'test-user', username: 'TestUser' })
  );

  render(<Home />);

  await waitFor(() => {
    const favorites = JSON.parse(
      window.localStorage.getItem('mealMindFavoriteMeals:test-user')
    );
    expect(favorites).toEqual([
      expect.objectContaining({
        name: 'Generated Porridge',
        category: 'Breakfast',
        ingredients: ['Oats'],
        steps: ['Cook the oats'],
      }),
    ]);
  });

  fireEvent.click(screen.getByRole('button', { name: /Favorites/ }));
  expect(await screen.findByRole('heading', { name: 'Generated Porridge' }))
    .toBeTruthy();
});

test('shows profile favorites and opens the Favorites page', async () => {
  loadMealPlans.mockResolvedValue([]);
  loadMostGeneratedMeals.mockResolvedValue([]);
  window.localStorage.setItem(
    'mealmind_session',
    JSON.stringify({ userId: 'test-user', username: 'TestUser' })
  );
  window.localStorage.setItem(
    'mealMindFavoriteMeals:test-user',
    JSON.stringify([{
      id: 'dinner:stored meal',
      name: 'Stored Meal',
      category: 'Dinner',
    }])
  );

  render(<Home />);
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.click(screen.getByRole('button', { name: /My Profile/ }));

  expect(screen.getByText('Stored Meal')).toBeTruthy();
  expect(screen.queryByText(/Email Address/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /View My Favorites/ }));

  expect(await screen.findByRole('heading', { name: 'Favorite Meals' }))
    .toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Stored Meal' })).toBeTruthy();
});
