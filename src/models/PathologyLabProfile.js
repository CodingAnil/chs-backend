const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pathologyLabSchema = new Schema(
  {
    labId: {
      type: String,
      default: null,
    },
    labName: {
      type: String,
      default: null,
    },
    contactPerson: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: Number,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    testsOffered: {
      type: [String], // e.g., ["CBC", "LFT", "KFT"]
      default: [],
    },
    labLicenseNumber: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    pinCode: {
      type: Number,
      default: null,
    },
    available: {
      type: Boolean,
      default: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Optional index for city and availability
pathologyLabSchema.index({ city: 1 });
pathologyLabSchema.index({ available: 1 });

module.exports = mongoose.model("PathologyLabProfile", pathologyLabSchema);
