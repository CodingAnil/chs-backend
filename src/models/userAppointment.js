const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    date: {
      type: Date,
      default: null,
    },
    time: {
      type: String,
      default: null,
    },
    refDoctor: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      default: null,
    },
    amount: {
      type: Number,
      default: null,
    },
    reason: {
      type: String,
      // require: true,
    },
    comments: {
      type: Number,
      default: null,
    },
    appointmentType: {
      type: String,
      enum: ["Video", "Audio", "Chat", "Home", "Consult"],
      default: "Consult",
    },
    appointmentFor: {
      type: String,
      enum: ["Self", "Dependent"],
      default: "Self",
    },
    symptoms: {
      type: String,
      default: null,
    },
    attachment: {
      type: String,
      default: null,
    },
    fileKey: {
      type: String,
      default: null,
    },
    appointmentPersonName: {
      type: String,
      default: null,
    },
    isInsurance: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Created", "Accepted", "Completed", "Cancelled"],
      default: "Pending",
    },
    call_status: {
      type: String,
      enum: ["idle", "ringing", "in_progress", "declined"],
      default: "idle",
    },
    testStatus: {
      type: String,
      enum: ["Normal", "High"],
      default: null,
    },
    
    prescriptionFile: {
      type: String,
      default: null,
    },
    prescriptionDate: {
      type: Date,
      default: null,
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

appointmentSchema.index({ status: 1 });
appointmentSchema.index({ refDoctor: 1 });

module.exports = mongoose.model("PatientAppointment", appointmentSchema);
