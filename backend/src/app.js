import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import connectDB from "./util/db.js";
import User from "./models/user.js";
import Resource from "./models/Resource.js";
import Booking from "./models/Booking.js";
import Notification from "./models/Notification.js";

import { protect } from "./util/authMiddleware.js";
import { authorize } from "./util/roleMiddleware.js";

dotenv.config();
connectDB();

const app = express();

const getDisplayResourceName = (name = "") => {
  if (/^projector\s*-/i.test(name)) {
    return "Projector";
  }

  if (/^sports?\s+equipment\s*-/i.test(name)) {
    return "Sports Equipment";
  }

  return name;
};

// Middleware
app.use(cors());
app.use(express.json());

/* ================= AUTH ================= */

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
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
      role: role || "user",
      department
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successful. Please log in with your new password." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/* ================= RESOURCES ================= */

// Create resource (Admin only)
app.post("/api/resources", protect, authorize("admin"), async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all resources
app.get("/api/resources", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single resource
app.get("/api/resources/:id", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update resource (Admin only)
app.put("/api/resources/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bookings
app.get("/api/bookings", protect, async (req, res) => {
  try {
    let bookings;
    if (req.user.role === "admin") {
      bookings = await Booking.find()
        .populate("resourceId")
        .populate("userId")
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ userId: req.user._id })
        .populate("resourceId")
        .sort({ createdAt: -1 });
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create booking
app.post("/api/bookings", protect, async (req, res) => {
  try {
    const { resourceId, startDate, endDate, purpose, requestedLocation, notes } = req.body;

    if (!requestedLocation?.trim()) {
      return res.status(400).json({ message: "Requested location is required" });
    }

    const booking = await Booking.create({
      resourceId,
      userId: req.user._id,
      startDate,
      endDate,
      purpose,
      requestedLocation: requestedLocation.trim(),
      notes,
      status: "pending"
    });

    const populatedBooking = await booking.populate("resourceId");
    const displayResourceName = getDisplayResourceName(populatedBooking.resourceId?.name);

    await Notification.create({
      userId: req.user._id,
      title: "Booking Submitted",
      message: `Your booking for ${displayResourceName} has been submitted. Waiting for admin approval.`,
      read: false
    });

    const admins = await User.find({ role: "admin" }).select("_id");
    if (admins.length > 0) {
      await Notification.insertMany(
        admins.map((admin) => ({
          userId: admin._id,
          title: "New Booking Request",
          message: `${req.user.name} submitted a booking request for ${displayResourceName}.`,
          read: false
        }))
      );
    }

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking
app.put("/api/bookings/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!isAdmin && req.body.status) {
      return res.status(403).json({ message: "Only admins can change booking status" });
    }

    Object.assign(booking, req.body);
    await booking.save({ validateBeforeSave: false });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve or reject booking (Admin only)
app.put("/api/bookings/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    if (status === "rejected" && !rejectionReason?.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const booking = await Booking.findById(req.params.id).populate("resourceId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be approved or rejected" });
    }

    booking.status = status;
    booking.rejectionReason = status === "rejected" ? rejectionReason.trim() : "";
    await booking.save({ validateBeforeSave: false });
    const displayResourceName = getDisplayResourceName(booking.resourceId?.name);

    await Notification.create({
      userId: booking.userId,
      title: status === "confirmed" ? "Booking Approved" : "Booking Rejected",
      message:
        status === "confirmed"
          ? `Your booking for ${displayResourceName} has been approved by the admin.`
          : `Your booking for ${displayResourceName} has been rejected by the admin. Reason: ${rejectionReason.trim()}`,
      read: false
    });

    const updatedBooking = await booking.populate("userId");

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete/Cancel booking
app.delete("/api/bookings/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await booking.deleteOne();

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking (User only)
app.put("/api/bookings/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("resourceId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (["cancelled", "rejected"].includes(booking.status)) {
      return res.status(400).json({ message: "Booking is already closed" });
    }

    const displayResourceName = getDisplayResourceName(booking.resourceId?.name);

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
        rejectionReason: ""
      },
      {
        new: true,
        runValidators: false
      }
    ).populate("resourceId");

    await Notification.create({
      userId: req.user._id,
      title: "Booking Cancelled",
      message: `Your booking for ${displayResourceName} has been cancelled.`,
      read: false
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/* ================= NOTIFICATIONS ================= */

app.get("/api/notifications", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/notifications/:id", protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= HOME ================= */

// Seed initial resources
app.get("/api/seed", async (req, res) => {
  try {
    const existingResources = await Resource.countDocuments();
    
    if (existingResources > 0) {
      return res.json({ message: "Resources already exist" });
    }

    const sampleResources = [
      {
        name: "Conference Room A",
        type: "Room",
        description: "Large conference room with projector and whiteboard",
        location: "Building A, 3rd Floor",
        capacity: 20,
        available: true
      },
      {
        name: "Lab Computer 1",
        type: "Equipment",
        description: "Computer lab with 30 workstations",
        location: "Building B, 2nd Floor",
        capacity: 30,
        available: true
      },
      {
        name: "Library Meeting Room",
        type: "Room",
        description: "Quiet meeting room for study groups",
        location: "Central Library, 1st Floor",
        capacity: 10,
        available: true
      },
      {
        name: "Auditorium",
        type: "Room",
        description: "Large auditorium for seminars and presentations",
        location: "Main Building, Ground Floor",
        capacity: 300,
        available: true
      },
      {
        name: "Projector (Portable)",
        type: "Equipment",
        description: "Portable projector for events",
        location: "Equipment Store",
        capacity: 1,
        available: true
      }
    ];

    await Resource.insertMany(sampleResources);
    res.json({ message: "Resources seeded successfully", count: sampleResources.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("College Resource Management System API");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
