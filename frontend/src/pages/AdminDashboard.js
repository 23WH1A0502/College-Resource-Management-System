import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./AdminDashboard.css";

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

function AdminDashboard() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("resources");
  const [processingBookingId, setProcessingBookingId] = useState("");
  const [rejectingBookingId, setRejectingBookingId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [newResource, setNewResource] = useState({
    name: "",
    type: "",
    description: "",
    location: "",
    capacity: ""
  });

  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [token, role, navigate]);

  const fetchData = async () => {
    try {
      const [resourcesRes, bookingsRes] = await Promise.all([
        API.get("/resources"),
        API.get("/bookings")
      ]);
      setResources(resourcesRes.data);
      setBookings(bookingsRes.data);
      setError("");
    } catch (err) {
      setError("Failed to load admin data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/resources", newResource);
      setResources([...resources, res.data]);
      setNewResource({
        name: "",
        type: "",
        description: "",
        location: "",
        capacity: ""
      });
      setError("");
    } catch (err) {
      setError("Failed to add resource");
    }
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await API.delete(`/resources/${id}`);
        setResources(resources.filter((resource) => resource._id !== id));
        setError("");
      } catch (err) {
        setError("Failed to delete resource");
      }
    }
  };

  const handleBookingStatus = async (id, status, reason = "") => {
    setProcessingBookingId(id);

    try {
      const res = await API.put(`/bookings/${id}/status`, {
        status,
        rejectionReason: reason
      });
      setBookings(bookings.map((booking) => (
        booking._id === id ? res.data : booking
      )));
      setRejectingBookingId("");
      setRejectionReason("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update booking status`);
    } finally {
      setProcessingBookingId("");
    }
  };

  const openRejectForm = (booking) => {
    setRejectingBookingId(booking._id);
    setRejectionReason(booking.rejectionReason || "");
  };

  const closeRejectForm = () => {
    setRejectingBookingId("");
    setRejectionReason("");
  };

  const submitRejection = (bookingId) => {
    handleBookingStatus(bookingId, "rejected", rejectionReason);
  };

  if (loading) {
    return <div className="admin-container"><p className="loading">Loading admin dashboard...</p></div>;
  }

  if (role !== "admin") {
    return <div className="admin-container"><p className="error">Access denied</p></div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <span className="admin-kicker">Academic Resource Oversight</span>
        <h1>Admin Dashboard</h1>
        <p>Review booking requests, manage campus assets, and keep resource usage transparent.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === "resources" ? "active" : ""}`}
          onClick={() => setActiveTab("resources")}
        >
          Resources
        </button>
        <button
          className={`tab ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          Booking Requests
        </button>
      </div>

      {activeTab === "resources" && (
        <div className="admin-section">
          <div className="section-card">
            <h2>Add New Resource</h2>
            <form onSubmit={handleAddResource} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Resource Name</label>
                  <input
                    type="text"
                    value={newResource.name}
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    required
                    placeholder="e.g., Conference Room A"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <input
                    type="text"
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    required
                    placeholder="e.g., Room, Equipment"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Resource description"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={newResource.location}
                    onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                    required
                    placeholder="Building/Room number"
                  />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    value={newResource.capacity}
                    onChange={(e) => setNewResource({ ...newResource, capacity: e.target.value })}
                    required
                    placeholder="Max capacity"
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit">Add Resource</button>
            </form>
          </div>

          <div className="section-card">
            <h2>Existing Resources ({resources.length})</h2>
            <div className="resources-list">
              {resources.map((resource) => (
                <div key={resource._id} className="list-item">
                  <div>
                    <h4>{getDisplayResourceName(resource.name)}</h4>
                    <p>{resource.description}</p>
                    <small>Location: {resource.location} | Capacity: {resource.capacity}</small>
                  </div>
                  <button
                    onClick={() => handleDeleteResource(resource._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="admin-section">
          <div className="section-card bookings-card">
            <div className="section-heading">
              <div>
                <h2>Booking Review Queue</h2>
                <p>Provide a clear academic reason when declining a request so the requester understands the decision.</p>
              </div>
              <span className="queue-count">{bookings.filter((booking) => booking.status === "pending").length} pending</span>
            </div>

            <div className="bookings-list professional-list">
              {bookings.length === 0 ? (
                <p className="no-data">No booking requests found</p>
              ) : (
                bookings.map((booking) => {
                  const isPending = booking.status === "pending";
                  const isRejecting = rejectingBookingId === booking._id;
                  const isProcessing = processingBookingId === booking._id;
                  const isSportsEquipment = isSportsResource(booking.resourceId);

                  return (
                    <article key={booking._id} className="booking-review-card">
                      <div className="booking-review-main">
                        <div className="booking-review-head">
                          <div>
                            <h3>{getDisplayResourceName(booking.resourceId?.name || "Unknown Resource")}</h3>
                            <p className="booking-review-subtitle">
                              {booking.resourceId?.type || "Resource"} request from {booking.userId?.name || "Unknown User"}
                            </p>
                          </div>
                          <span className={`booking-status ${booking.status}`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="booking-meta-grid">
                          {!isSportsEquipment && (
                            <div>
                              <span className="meta-label">Location</span>
                              <p>{booking.resourceId?.location || "Not provided"}</p>
                            </div>
                          )}
                          <div>
                            <span className="meta-label">
                              {isSportsEquipment ? "Requested Equipment" : "Requested Location"}
                            </span>
                            <p>{booking.requestedLocation || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="meta-label">Schedule</span>
                            <p>{new Date(booking.startDate).toLocaleString()} to {new Date(booking.endDate).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="meta-label">Purpose</span>
                            <p>{booking.purpose || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="meta-label">Notes</span>
                            <p>{booking.notes || "No additional notes"}</p>
                          </div>
                        </div>

                        {booking.status === "rejected" && booking.rejectionReason && (
                          <div className="decision-note rejection-note">
                            <span className="meta-label">Recorded Rejection Reason</span>
                            <p>{booking.rejectionReason}</p>
                          </div>
                        )}

                        {isPending && !isRejecting && (
                          <div className="booking-action-buttons">
                            <button
                              onClick={() => handleBookingStatus(booking._id, "confirmed")}
                              className="btn-approve"
                              disabled={isProcessing}
                            >
                              {isProcessing ? "Updating..." : "Approve Request"}
                            </button>
                            <button
                              onClick={() => openRejectForm(booking)}
                              className="btn-reject"
                              disabled={isProcessing}
                            >
                              Reject with Reason
                            </button>
                          </div>
                        )}

                        {isPending && isRejecting && (
                          <div className="rejection-panel">
                            <label htmlFor={`rejection-${booking._id}`}>Reason for rejection</label>
                            <textarea
                              id={`rejection-${booking._id}`}
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows="4"
                              placeholder="Explain the academic or scheduling reason for declining this request."
                            />
                            <div className="booking-action-buttons">
                              <button
                                onClick={() => submitRejection(booking._id)}
                                className="btn-reject"
                                disabled={isProcessing || !rejectionReason.trim()}
                              >
                                {isProcessing ? "Saving..." : "Confirm Rejection"}
                              </button>
                              <button
                                onClick={closeRejectForm}
                                className="btn-secondary"
                                disabled={isProcessing}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
