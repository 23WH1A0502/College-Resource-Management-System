
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import connectDB from "./util/db.js";
import User from "./models/User.js";
import Resource from "./models/Resource.js";
import Booking from "./models/Booking.js";
import TimeSlot from "./models/TimeSlot.js";
import Department from "./models/Department.js";
import Notification from "./models/Notification.js";

import { protect } from "./util/authMiddleware.js";
import { authorize } from "./util/roleMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

/* ================= AUTH ================= */
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashedPassword, role });
  res.json(user);
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user });
});

/* ================= RESOURCES ================= */
app.post("/api/resources", protect, authorize("admin"), async (req, res) => {
  const resource = await Resource.create(req.body);
  res.json(resource);
});

app.get("/api/resources", protect, async (req, res) => {
  const resources = await Resource.find();
  res.json(resources);
});

/* ================= BOOKINGS ================= */
app.post("/api/bookings", protect, async (req, res) => {
  const booking = await Booking.create({ ...req.body, user: req.user._id });
  res.json(booking);
});

app.put("/api/bookings/:id/approve", protect, authorize("admin"), async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  booking.status = "approved";
  await booking.save();
  res.json(booking);
});

/* ================= HOME ================= */
app.get("/", (req, res) => {
  res.send("College Resource Management System API");
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
