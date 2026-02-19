import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["admin", "faculty", "student"], 
      default: "student" 
    },

    // 👇 ADD THIS
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
