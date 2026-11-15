import { useState, useEffect } from 'react';
import { readFavoriteMeals } from '../Components/favoriteMealsStorage';
import './style.css';

const SESSION_KEY = 'mealmind_session';

function getUserProfileKey(username) {
  return `mealmind_profile_${username.toLowerCase()}`;
}

function Profile({ onClose, favoriteMeals, onAddFavorites }) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [savedFavoriteMeals] = useState(readFavoriteMeals);

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const displayedFavoriteMeals = favoriteMeals ?? savedFavoriteMeals;

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);

      if (!savedSession) return;

      const activeUser = JSON.parse(savedSession);
      const currentUsername = activeUser.username || '';

      setUsername(currentUsername);

      const savedProfile = localStorage.getItem(
        getUserProfileKey(currentUsername)
      );

      if (savedProfile) {
        const profile = JSON.parse(savedProfile);

        setName(profile.name || '');
        setBio(profile.bio || '');
      } else {
        setName(currentUsername);
      }
    } catch {
      setMessage('Unable to load your profile.');
    }
  }, []);

  useEffect(() => {
    if (!onClose) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function handleSave(event) {
    event.preventDefault();

    try {
      const savedSession = localStorage.getItem(SESSION_KEY);

      if (!savedSession) {
        setMessage('Please log in first.');
        return;
      }

      const activeUser = JSON.parse(savedSession);

      const profile = {
        name,
        bio
      };

      localStorage.setItem(
        getUserProfileKey(activeUser.username),
        JSON.stringify(profile)
      );

      setIsEditing(false);
      setMessage('Your profile has been updated successfully!');
    } catch {
      setMessage('Unable to save your profile.');
    }
  }

  function handleAddFavorites() {
    if (onAddFavorites) {
      onAddFavorites();
    } else {
      window.location.assign('/favorites');
    }
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.assign('/login');
  }

  const initials = (name || username)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

  const profileContent = (
    <div className="profile-content">

      {/* PROFILE HEADING */}
      <div className="profile-page-heading">
        <span className="profile-kicker">YOUR MEALMIND SPACE</span>
        <h1>Profile</h1>
        <p>Get to know your food-loving personality.</p>
      </div>

      {/* PROFILE INFORMATION */}
      <div className="profile-main-card">

        <div className="profile-user-info">
          <div className="profile-avatar">
            {initials || 'M'}
          </div>

          <div className="profile-user-details">
            <span className="profile-label">PROFILE NAME</span>
            <h2>{name || 'Your Name'}</h2>
            <p>@{username || 'username'}</p>
          </div>
        </div>

        {/* ABOUT ME */}
        <div className="profile-about">

          <div className="profile-about-heading">
            <h3>About Me</h3>

            <button
              type="button"
              className="profile-edit-button"
              onClick={() => {
                setIsEditing(!isEditing);
                setMessage('');
              }}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="profile-edit-form">

              <div className="profile-field">
                <label htmlFor="profileName">Profile Name</label>
                <input
                  id="profileName"
                  type="text"
                  value={name}
                  maxLength={80}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profileBio">About Me</label>
                <textarea
                  id="profileBio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us something about yourself..."
                  rows="4"
                  maxLength={250}
                />
              </div>

              <button
                type="submit"
                className="profile-save-button"
              >
                Save Changes →
              </button>

            </form>
          ) : (
            <div className="profile-about-content">

              <p className="profile-bio">
                {bio || 'Tell us something about yourself! Add a short introduction about your food interests and favorite meals.'}
              </p>

            </div>
          )}
        </div>

      </div>

      {/* MY FAVORITES */}
      <div className="profile-favorites-section">

        <div className="profile-favorites-heading">
          <div>
            <span className="profile-kicker">YOUR FOOD COLLECTION</span>
            <h2>My Favorites</h2>
            <p>Your most-loved meals in one place.</p>
          </div>

          <span className="profile-favorites-icon">♡</span>
        </div>

        <div className="profile-favorites-grid">

          {displayedFavoriteMeals.slice(0, 2).map((meal, index) => {
            const mealName = meal.name || meal.title || 'Favorite Meal';
            const mealImage = meal.image || meal.imageUrl;

            return (
              <div
                className="profile-favorite-card"
                key={meal.id || mealName + index}
              >
                <div className="profile-favorite-photo">

                  {mealImage ? (
                    <img
                      src={mealImage}
                      alt={mealName}
                    />
                  ) : (
                    <div className="profile-favorite-placeholder">
                      🍽️
                    </div>
                  )}

                  <span className="profile-favorite-heart">♥</span>
                </div>

                <div className="profile-favorite-details">
                  <h3>{mealName}</h3>
                  <p>
                    {meal.category || meal.type || 'Favorite Meal'}
                  </p>
                </div>
              </div>
            );
          })}

          {displayedFavoriteMeals.length === 0 && (
            <div className="profile-empty-favorites">
              <span>♡</span>
              <h3>No favorites yet</h3>
              <p>Start saving your favorite meals!</p>
            </div>
          )}

        </div>

        <button
          type="button"
          className="profile-add-favorites"
          onClick={handleAddFavorites}
        >
          <span className="profile-add-icon">+</span>
          <span>View My Favorites</span>
        </button>

      </div>

      {message && (
        <p className="profile-save-message" role="status">
          {message}
        </p>
      )}

      {/* LOGOUT */}
      <div className="profile-bottom">
        <button
          type="button"
          className="profile-logout-button"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>

    </div>
  );

  if (onClose) {
    return (
      <div
        className="profile-drawer-backdrop"
        onClick={event => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <aside
          className="profile-page profile-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-title"
        >
          <header className="profile-header profile-drawer-header">

            <a href="/" className="profile-brand">
              <span className="profile-brand-mark">m</span>
              <span>mealmind</span>
            </a>

            <button
              className="profile-drawer-close"
              type="button"
              onClick={onClose}
              aria-label="Close profile"
            >
              ×
            </button>

          </header>

          {profileContent}
        </aside>
      </div>
    );
  }

  return (
    <main className="profile-page">

      <header className="profile-header">

        <a href="/" className="profile-brand">
          <span className="profile-brand-mark">m</span>
          <span>mealmind</span>
        </a>

        <nav className="profile-nav">
          <a href="/">Back to Home</a>

          <button
            type="button"
            className="profile-nav-login"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </nav>

      </header>

      {profileContent}

    </main>
  );
}

export default Profile;
