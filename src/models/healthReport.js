const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const healthReportSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    heartRate: {
      type: Number,
      default: null,
    },
    bodyTemperature: {
      type: Number,
      default: null,
    },
    glucoseLevel: {
      type: Number,
      default: null,
    },
    spo2: {
      type: Number,
      default: null,
    },
    bloodPressure: {
      type: String, // Stored as "SYS/DIA"
      default: null,
    },
    bmi: {
      type: Number,
      default: null,
    },
    healthFile: {
      type: String,
      default: null,
    },
    fileKey: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthReport", healthReportSchema);
