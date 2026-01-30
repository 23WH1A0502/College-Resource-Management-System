import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: Date,
    endTime: Date,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
