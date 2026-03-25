import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./BookResource.css";

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

function BookResource() {
  const location = useLocation();
  const navigate = useNavigate();
  const resource = location.state?.resource;
  const isSportsEquipment = isSportsResource(resource);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    purpose: "",
    requestedLocation: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!resource) {
    return (
      <div className="book-resource-container">
        <div className="error-box">
          <p>No resource selected. Please go back and select a resource.</p>
          <button onClick={() => navigate("/resources")}>Back to Resources</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const bookingData = {
        resourceId: resource._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        purpose: formData.purpose,
        requestedLocation: formData.requestedLocation,
        notes: formData.notes
      };

      await API.post("/bookings", bookingData);
      setSuccess(true);

      setTimeout(() => {
        navigate("/notifications");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book resource");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="book-resource-container">
        <div className="success-box">
          <h2>Booking Submitted!</h2>
          <p>Your booking is pending admin approval. Redirecting to notifications...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="book-resource-container">
      <div className="booking-form-box">
        <h2>{getDisplayResourceName(resource.name)}</h2>

        <div className="resource-summary">
          <p><strong>Type:</strong> {resource.type}</p>
          {!isSportsEquipment && (
            <p><strong>Current Resource Location:</strong> {resource.location}</p>
          )}
          <p><strong>Capacity:</strong> {resource.capacity}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="startDate">Start Date & Time</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date & Time</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose of Booking</label>
            <input
              type="text"
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="e.g., Class, Meeting, Event"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="requestedLocation">
              {isSportsEquipment ? "Equipment Name" : "Required Location"}
            </label>
            <input
              type="text"
              id="requestedLocation"
              name="requestedLocation"
              value={formData.requestedLocation}
              onChange={handleChange}
              placeholder={
                isSportsEquipment
                  ? "Enter the sports equipment you need, for example Football, Cricket Bat, or Shuttle Rackets"
                  : "Enter the location you want the admin to consider"
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information..."
              rows="4"
            ></textarea>
          </div>

          <div className="form-buttons">
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? "Submitting..." : "Submit Booking Request"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/resources")}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookResource;
