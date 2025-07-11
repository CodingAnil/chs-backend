const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nurseProfileSchema = new Schema(
  {
    firstName: 
     { 
      type: String, 
       default: null 
     },
    lastName: 
      { 
        type: String, 
        default: null
      },
    displayName:
     { 
       type: String,
       default: null 
      },
    phoneNumber:
     { 
      type: Number,
       default: null
       },
    email:
     { 
       type: String,
       default: null
       },
    designation:
     { 
       type: String,
       default: null
       },
    languages:
     { 
       type: [String],
       default: null 
      },
    address:
     { 
      type: String,
       default: null
       },
    city: 
    { 
      type: String,
       default: null
       },
    state:
     { 
      type: String, 
      default: null 
    },
    country:
     { 
      type: String, 
      default: null 
    },

    availability:
     {
       type: Boolean, 
      default: true 
    },
    availabilityDetails: {
      twentyFourHour: { type: Boolean, default: false },
      readyForTravel: { type: Boolean, default: false },
      price: { type: Number, default: 0 },
      wardName: { type: String, default: "General Ward" },
      floor: { type: String, default: "2" },
      weeklySchedule: {
        type: Map,
        of: {
          morning: { type: String, default: "" },
          evening: { type: String, default: "" },
        },
        default: {}
      }
    },

    qualifications: {
      licenseNumber: String,
      experience: String,
      hospitalsWorked: [
        {
          name: String,
          designation: String,
          duration: String
        }
      ]
    },
    skills: [String],
    documents: {
      idProof: String,
      educationCertificates: String,
      nursingLicense: String,
      policeVerification: String
    },
    dob: { type: String, default: null },
    gender: { type: String, default: null },
    achievement: { type: String, default: null },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

nurseProfileSchema.index({ availability: 1 });

module.exports = mongoose.model("NurseProfile", nurseProfileSchema);
