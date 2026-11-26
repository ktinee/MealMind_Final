import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Profile from './Pages/Profile';
import Signup from './Pages/Signup';

const SESSION_KEY = 'mealmind_session';

function getSessionUser() {
  try {
    const savedSession = window.localStorage.getItem(SESSION_KEY);
    if (!savedSession) return null;

    const session = JSON.parse(savedSession);
    if (!session?.userId || !session?.sessionToken) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function App() {
  const sessionUser = getSessionUser();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/login"
          element={sessionUser ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={sessionUser ? <Navigate to="/home" replace /> : <Signup />}
        />
        <Route
          path="/home"
          element={sessionUser ? <Home /> : <Navigate to="/" replace />}
        />
       
        <Route
          path="/profile"
          element={sessionUser ? <Profile /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
