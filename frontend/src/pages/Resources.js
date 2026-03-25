import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Resources.css";

const getDisplayResourceName = (name = "") => {
  if (/^projector\s*-/i.test(name)) {
    return "Projector";
  }

  if (/^sports?\s+equipment\s*-/i.test(name)) {
    return "Sports Equipment";
  }

  return name;
};

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchResources();
  }, [token, navigate]);

  const fetchResources = async () => {
    try {
      const res = await API.get("/resources");
      setResources(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load resources");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="resources-container"><p className="loading">Loading resources...</p></div>;
  }

  if (error) {
    return <div className="resources-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1>Available Resources</h1>
        <p>Browse available resources and submit your preferred location for admin approval.</p>
      </div>

      {resources.length === 0 ? (
        <div className="no-resources">
          <p>No resources available at the moment.</p>
        </div>
      ) : (
        <div className="resources-grid">
          {resources.map((resource) => (
            <div key={resource._id} className="resource-card">
              <div className="resource-card-content">
                <h3>{getDisplayResourceName(resource.name)}</h3>
                <p className="resource-description">{resource.description}</p>
                <div className="resource-details">
                  <p><strong>Type:</strong> {resource.type}</p>
                  <p><strong>Location:</strong> {resource.location}</p>
                  <p><strong>Capacity:</strong> {resource.capacity}</p>
                </div>
              </div>
              <Link
                to="/book-resource"
                state={{ resource }}
                className="book-btn"
              >
                Book Resource
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Resources;
