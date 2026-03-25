import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);

// Resource APIs
export const getResources = () => API.get("/resources");
export const getResourceById = (id) => API.get(`/resources/${id}`);
export const createResource = (data) => API.post("/resources", data);
export const updateResource = (id, data) => API.put(`/resources/${id}`, data);
export const deleteResource = (id) => API.delete(`/resources/${id}`);

// Booking APIs
export const getBookings = () => API.get("/bookings");
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const createBooking = (data) => API.post("/bookings", data);
export const updateBooking = (id, data) => API.put(`/bookings/${id}`, data);
export const updateBookingStatus = (id, status) => API.put(`/bookings/${id}/status`, { status });
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);

// Notification APIs
export const getNotifications = () => API.get("/notifications");
export const markNotificationAsRead = (id) => API.put(`/notifications/${id}`, { read: true });

// User APIs
export const getMe = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/auth/profile", data);

export default API;
