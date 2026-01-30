import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource" },
  startTime: Date,
  endTime: Date,
  isBooked: { type: Boolean, default: false },
});

export default mongoose.model("TimeSlot", timeSlotSchema);
