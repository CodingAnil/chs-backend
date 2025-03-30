const mongoose = require("mongoose");

const teamApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    userId: { type: String, default: null },
    email: { type: String, required: true },
    experience: { type: String, required: true },
    designation: { type: String, required: true },
    message: { type: String, required: true },
    resumeUrl: { type: String, required: true }, 
    resumeKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamApplication", teamApplicationSchema);
