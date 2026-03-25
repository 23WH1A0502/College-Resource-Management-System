import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const navigate = useNavigate();

  const getNavLinkClass = ({ isActive }) =>
    `nav-link${isActive ? " active" : ""}`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
          <span className="navbar-logo-mark" aria-hidden="true">
            <span className="logo-frame">
              <span className="logo-book logo-book-left"></span>
              <span className="logo-book logo-book-center"></span>
              <span className="logo-book logo-book-right"></span>
            </span>
          </span>
          <span className="navbar-brand">
            <span className="navbar-title">College Resource System</span>
            <span className="navbar-subtitle">Academic Resource Management</span>
          </span>
        </Link>

        <button
          className="menu-icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          type="button"
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>

        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <NavLink to="/" end className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
          </li>

          {token ? (
            <>
              <li className="nav-item">
                <NavLink to="/resources" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                  Resources
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/notifications" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                  Notifications
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/my-bookings" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                  My Bookings
                </NavLink>
              </li>
              {userRole === "admin" && (
                <li className="nav-item">
                  <NavLink to="/admin" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                    Admin Dashboard
                  </NavLink>
                </li>
              )}
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink to="/login" className={getNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                  Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/register" className={({ isActive }) => `${getNavLinkClass({ isActive })} nav-cta`} onClick={() => setIsMenuOpen(false)}>
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
