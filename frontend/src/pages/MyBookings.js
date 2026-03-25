import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./MyBookings.css";

const isSportsResource = (resource) => {
  const searchableText = `${resource?.name || ""} ${resource?.type || ""}`.toLowerCase();
  return searchableText.includes("sport");
};

const getDisplayResourceName = (name = "") => {
  if (/^projector\s*-/i.test(name)) {
    return "Projector";
  }

  if (/^sports?\s+equipment\s*-/i.test(name)) {
    return "Sports Equipment";
  }

  return name;
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [token, navigate]);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings");
      setBookings(res.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await API.put(`/bookings/${id}/cancel`);
        await fetchBookings();
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to cancel booking");
      }
    }
  };

  if (loading) {
    return <div className="bookings-container"><p className="loading">Loading your bookings...</p></div>;
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Your resource bookings</p>
      </div>

      {error && <p className="error">{error}</p>}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings yet. <a href="/resources">Book a resource now!</a></p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              {(() => {
                const isSportsEquipment = isSportsResource(booking.resourceId);

                return (
                  <>
              <div className="booking-header-row">
                <h3>{getDisplayResourceName(booking.resourceId?.name || "Unknown Resource")}</h3>
                <span className={`status-badge ${booking.status || "pending"}`}>
                  {booking.status || "Pending"}
                </span>
              </div>

              <div className="booking-details">
                <p>
                  <strong>Resource Type:</strong> {booking.resourceId?.type || "N/A"}
                </p>
                {!isSportsEquipment && (
                  <p>
                    <strong>Resource Location:</strong> {booking.resourceId?.location || "N/A"}
                  </p>
                )}
                <p>
                  <strong>{isSportsEquipment ? "Requested Equipment:" : "Requested Location:"}</strong> {booking.requestedLocation || "N/A"}
                </p>
                <p>
                  <strong>Start Date:</strong> {new Date(booking.startDate).toLocaleString()}
                </p>
                <p>
                  <strong>End Date:</strong> {new Date(booking.endDate).toLocaleString()}
                </p>
                <p>
                  <strong>Purpose:</strong> {booking.purpose}
                </p>
                {booking.notes && (
                  <p>
                    <strong>Notes:</strong> {booking.notes}
                  </p>
                )}
                {booking.status === "rejected" && booking.rejectionReason && (
                  <div className="booking-decision-note">
                    <strong>Rejection Reason:</strong>
                    <p>{booking.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div className="booking-actions">
                {booking.status !== "cancelled" && booking.status !== "rejected" && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="btn-cancel-booking"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
