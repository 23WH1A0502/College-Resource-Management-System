import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Resources from "./pages/Resources";
import BookResource from "./pages/BookResource";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import MyBookings from "./pages/MyBookings";

function App() {
  return (
    <Router>

      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/book-resource" element={<BookResource />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

    </Router>
  );
}

export default App;
