import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

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
            <form 
              className="search-wrapper"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchInput.trim()) {
                  navigate(`/events?search=${encodeURIComponent(searchInput.trim())}`);
                  setSearchInput('');
                } else {
                  navigate('/events');
                }
              }}
            >
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
                placeholder="Search events..."
                className="search-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
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
