const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      // required: true,
      // unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    fileKey: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["Patient", "Doctor", "Pharmacy retailers", "Admin", "Pathology","Nursing"],
      default: "Patient",
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      default: null,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "UserSubscription",
      default: null,
    },
    notification: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["Pending", "Suspended", "Active", "Rejected"],
      default: "Pending",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
