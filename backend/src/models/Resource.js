import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
