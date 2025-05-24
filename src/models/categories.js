const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: null
    },
    subcategories: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        default: null
      }
    }],
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

// Index for optimized search
// categorySchema.index({ name: 1 });

const Category = mongoose.model("Categories", categorySchema);

module.exports = Category; 