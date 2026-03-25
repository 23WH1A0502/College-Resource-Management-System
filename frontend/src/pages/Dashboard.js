import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const cardIcons = {
  resources: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4a4 4 0 0 1 4 4v1.6c0 .7.2 1.4.5 2l1 1.9c.5 1 .1 2.2-.9 2.7-.3.1-.6.2-.9.2H8.3a2 2 0 0 1-2-2c0-.3.1-.6.2-.9l1-1.9c.3-.6.5-1.3.5-2V8a4 4 0 0 1 4-4Z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </svg>
  ),
  bookings: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3M17 3v3M5.5 6h13A1.5 1.5 0 0 1 20 7.5v11A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6Z" />
      <path d="M4 10h16M9 14h2v2H9zM13 14h2v2h-2z" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 1.8 2.2 2.9.6-.9 2.8 1.9 2.2-2.3 1.7.2 3-2.8-.8-2.8.8.2-3-2.3-1.7 1.9-2.2-.9-2.8 2.9-.6Z" />
      <path d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
    </svg>
  )
};

function Dashboard() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return (
      <div className="dashboard">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="section-kicker">Campus Operations</span>
            <h1>Manage campus resources in one place.</h1>
            <p>
              Book rooms, equipment, and shared spaces through a simple academic resource portal.
            </p>
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Create Account
              </Link>
            </div>
          </div>

          <div className="hero-summary">
            <div className="summary-card">
              <span className="summary-label">Booking Governance</span>
              <h3>Approval workflow</h3>
              <p>Submit requests and receive clear admin decisions.</p>
            </div>
            <div className="summary-card">
              <span className="summary-label">Resource Visibility</span>
              <h3>Shared resource view</h3>
              <p>See available spaces and equipment across campus.</p>
            </div>
          </div>
        </section>

        <section className="features-panel">
          <div className="section-heading">
            <span className="section-kicker">Platform Highlights</span>
            <h2>Built for everyday academic use</h2>
          </div>

          <div className="features">
            <article className="feature-card">
              <span className="feature-index">01</span>
              <h3>Browse Resources</h3>
              <p>View available rooms and equipment.</p>
            </article>
            <article className="feature-card">
              <span className="feature-index">02</span>
              <h3>Submit Requests</h3>
              <p>Create booking requests with schedule and purpose.</p>
            </article>
            <article className="feature-card">
              <span className="feature-index">03</span>
              <h3>Track Decisions</h3>
              <p>Check approvals, rejections, and notifications.</p>
            </article>
            <article className="feature-card">
              <span className="feature-index">04</span>
              <h3>Admin Review</h3>
              <p>Manage requests, resources, and approvals.</p>
            </article>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <section className="hero-panel dashboard-home">
        <div className="hero-copy">
          <span className="section-kicker">Academic Resource Portal</span>
          <h1>Welcome back.</h1>
          <p>
            Access your requests, notifications, and resource tools from one dashboard.
          </p>
        </div>

        <div className="hero-summary compact">
          <div className="summary-card">
            <span className="summary-label">Current Access</span>
            <h3>{role === "admin" ? "Administrative Workspace" : "User Workspace"}</h3>
            <p>Use the shortcuts below to move quickly.</p>
          </div>
        </div>
      </section>

      <section className="shortcut-panel">
        <div className="section-heading">
          <span className="section-kicker">Quick Access</span>
          <h2>Choose a workspace</h2>
        </div>

        <div className="dashboard-grid">
          <Link to="/resources" className="dashboard-card">
            <span className="card-icon">{cardIcons.resources}</span>
            <span className="card-eyebrow">Resources</span>
            <h3>Browse Resources</h3>
            <p>View available rooms and equipment.</p>
          </Link>

          <Link to="/notifications" className="dashboard-card">
            <span className="card-icon">{cardIcons.notifications}</span>
            <span className="card-eyebrow">Updates</span>
            <h3>Notifications</h3>
            <p>Check approval decisions and updates.</p>
          </Link>

          <Link to="/my-bookings" className="dashboard-card">
            <span className="card-icon">{cardIcons.bookings}</span>
            <span className="card-eyebrow">History</span>
            <h3>My Bookings</h3>
            <p>Track your requests and booking status.</p>
          </Link>

          {role === "admin" && (
            <Link to="/admin" className="dashboard-card admin-card">
              <span className="card-icon">{cardIcons.admin}</span>
              <span className="card-eyebrow">Administration</span>
              <h3>Admin Dashboard</h3>
              <p>Manage resources and booking approvals.</p>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
