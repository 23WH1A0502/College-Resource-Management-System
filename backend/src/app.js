import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import connectDB from "./util/db.js";
import User from "./models/User.js";
import Resource from "./models/Resource.js";
import Booking from "./models/Booking.js";
import Notification from "./models/Notification.js";

import { protect } from "./util/authMiddleware.js";
import { authorize } from "./util/roleMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

/* ================= AUTH ================= */

// Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role, department } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    department
  });

  res.json(user);
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, user });
});


/* ================= RESOURCES ================= */

// Create resource (Admin only)
app.post("/api/resources", protect, authorize("admin"), async (req, res) => {
  const resource = await Resource.create(req.body);
  res.json(resource);
});

// Get all resources
app.get("/api/resources", protect, async (req, res) => {
  const resources = await Resource.find();
  res.json(resources);
});

// Get single resource
app.get("/api/resources/:id", protect, async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return res.status(404).json({ message: "Resource not found" });
  }

  res.json(resource);
});

// Update resource (Admin only)
app.put("/api/resources/:id", protect, authorize("admin"), async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!resource) {
    return res.status(404).json({ message: "Resource not found" });
  }

  res.json(resource);
});

// Delete resource (Admin only)
app.delete("/api/resources/:id", protect, authorize("admin"), async (req, res) => {
  const resource = await Resource.findByIdAndDelete(req.params.id);

  if (!resource) {
    return res.status(404).json({ message: "Resource not found" });
  }

  res.json({ message: "Resource deleted successfully" });
});


/* ================= BOOKINGS ================= */

// Create booking (with conflict check)
app.post("/api/bookings", protect, async (req, res) => {
  const { resource, startTime, endTime } = req.body;

  const conflict = await Booking.findOne({
    resource,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: "approved"
  });

  if (conflict) {
    return res.status(400).json({
      message: "Resource already booked for this time slot"
    });
  }

  const booking = await Booking.create({
    resource,
    startTime,
    endTime,
    user: req.user._id
  });

  res.json(booking);
});

// Approve booking (Admin only)
app.put("/api/bookings/:id/approve", protect, authorize("admin"), async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking.status = "approved";
  await booking.save();

  await Notification.create({
    user: booking.user,
    message: "Your booking has been approved"
  });

  res.json(booking);
});

// Reject booking (Admin only)
app.put("/api/bookings/:id/reject", protect, authorize("admin"), async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking.status = "rejected";
  await booking.save();

  await Notification.create({
    user: booking.user,
    message: "Your booking has been rejected"
  });

  res.json(booking);
});

// Cancel booking (User only)
app.put("/api/bookings/:id/cancel", protect, async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not allowed" });
  }

  booking.status = "rejected";
  await booking.save();

  res.json({ message: "Booking cancelled successfully" });
});


/* ================= NOTIFICATIONS ================= */

app.get("/api/notifications", protect, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id
  }).sort({ createdAt: -1 });

  res.json(notifications);
});


/* ================= HOME ================= */

app.get("/", (req, res) => {
  res.send("College Resource Management System API");
});


app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
