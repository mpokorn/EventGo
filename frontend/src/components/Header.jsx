import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/header.css';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-content">

          {/* Logo - Left */}
          <Link to="/" className="header-logo">
            EventGo
          </Link>

          {/* Search bar - Center */}
          <div className="header-search">
            <div className="search-wrapper">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              <input
                type="text"
                placeholder="Search a city, club, event..."
                className="search-input"
              />
            </div>
          </div>

          {/* Navigation - Right */}
          <nav className="header-nav">

            {/* ORGANIZER LOGIC */}
            {user?.role === "organizer" ? (
              <Link to="/organizer" className="nav-link">
                Organizer Dashboard
              </Link>
            ) : (
              <Link to="/register/organizer" className="nav-link">
                List an event
              </Link>
            )}

            {/* Logged in */}
            {user ? (
              <>
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>

                <button onClick={logout} className="nav-link nav-button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
                <Link to="/login" className="nav-link nav-link-primary">
                  Login
                </Link>
              </>
            )}

          </nav>
        </div>
      </div>
    </header>
  );
}
