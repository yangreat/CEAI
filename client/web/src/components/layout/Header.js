import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // This would typically come from authentication context or state management
  const logOut = () => {
    setIsLoggedIn(false);
    // Clear token from localStorage
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="logo">
            Cognitive Empowerment
          </Link>
          <ul className="nav-links">
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/training/memory">Memory</Link>
            </li>
            <li>
              <Link to="/training/attention">Attention</Link>
            </li>
            <li>
              <Link to="/training/executive">Executive</Link>
            </li>
            <li>
              <Link to="/training/language">Language</Link>
            </li>
            <li>
              <Link to="/training/logic">Logic</Link>
            </li>
            <li>
              <Link to="/training/emotion">Emotion</Link>
            </li>
            <li>
              <Link to="/progress">Progress</Link>
            </li>
            {isLoggedIn ? (
              <li>
                <a href="#!" onClick={logOut}>
                  Logout
                </a>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 