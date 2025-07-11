const nurseProfile = require("../models/nurseProfile");  
const User = require("../models/user");
const PatientAppointment = require("../models/userAppointment");


const {
  sendResponse,
  handleingError,
  capitalizeFirstLetter,
} = require("../utils");
const { default: mongoose } = require("mongoose");
const patientProfile = require("../models/patientProfile");

// Nurses might not need Twilio (remove if unused)
const {
  jwt: { AccessToken },
} = require("twilio");
const VideoGrant = AccessToken.VideoGrant;
const ChatGrant = AccessToken.ChatGrant;

const updateAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    const profileId = user.profile;
    if (!profileId) {
      return sendResponse(res, 400, "Profile id is required");
    }

    const { availability } = req.body;
    if (typeof availability !== 'boolean') {
      return sendResponse(res, 400, "Availability must be a boolean value");
    }

    const updatedNurse = await nurseProfile.findByIdAndUpdate(
      profileId,
      { availability },
      { new: true }
    );

    return sendResponse(res, 200, "Availability updated successfully", updatedNurse);
  } catch (error) {
    return handleingError(res, error);
  }
};


// Update nurse profile with personal details
updateProfile = async (req, res) => {
  try {
    const nurseId = req.params.userId;
    const user = await User.findById(nurseId);
    
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const updatedFields = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      displayName: req.body.displayName,
      designation: req.body.designation,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      languages: req.body.languages,
      dob: req.body.dob,
      gender: req.body.gender,
      address: req.body.address,
      qualifications: req.body.qualifications,
      skills: req.body.skills,
      documents: req.body.documents
    };
    const profileId = user.profile.toString();
    const updatedNurse = await nurseProfile.findByIdAndUpdate(
      profileId,  // Use the string version
      updatedFields,
      { new: true }
    );

    if (!updatedNurse) {
      return res.status(404).json({ status: false, message: "Nurse profile not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Nurse profile updated successfully",
      data: updatedNurse,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "Server error while updating nurse profile",
    });
  }
};


// 2. Get All Nurses vs code
const getAllNurses = async (req, res) => {
  try {
    let nurses = await User.find({ role: "Nursing" }) // Changed to "Nurse"
      .populate("profile")
      .exec();
    if (!nurses || nurses?.length == 0) {
      return sendResponse(res, 200, "Nurses not found");
    }
    return sendResponse(res, 200, "Nurses fetched successfully", nurses);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// 3. Nurse Dashboard Data (Simplified)
const getNurseDashboardData = async (req, res) => {
  try {
    const nurseId = req.params?.nurseId; // Changed to nurseId

    if (!nurseId) {
      return sendResponse(res, 400, "Nurse ID is required!");
    }

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    // Query for today's appointments assigned to the nurse
    const todayAppointments = await PatientAppointment.find({
      refNurse: nurseId, // Changed to refNurse (ensure your schema supports this)
      date: { $gte: startOfToday, $lte: endOfToday },
    }).populate("patientId");

    // Count patients assigned to the nurse
    const assignedPatients = await PatientAppointment.find({
      refNurse: nurseId,
    }).distinct("patientId");

    // Simplified metrics for nurses
    const responseData = {
      todayAppointments: todayAppointments.length,
      assignedPatients: assignedPatients.length,
      // Add nurse-specific metrics (e.g., "medicationsAdministered")
    };

    return sendResponse(res, 200, "Nurse dashboard data fetched", responseData);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

const getNurseprofile = async (req, res) => {
  try {
    const nurseId = req.params?.nurseId; // Changed to nurseId

    if (!nurseId) {
      return sendResponse(res, 400, "Nurse ID is required!");
    }

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    // Query for today's appointments assigned to the nurse
    const todayAppointments = await PatientAppointment.find({
      refNurse: nurseId, // Changed to refNurse (ensure your schema supports this)
      date: { $gte: startOfToday, $lte: endOfToday },
    }).populate("patientId");

    // Count patients assigned to the nurse
    const assignedPatients = await PatientAppointment.find({
      refNurse: nurseId,
    }).distinct("patientId");

    // Simplified metrics for nurses
    const responseData = {
      todayAppointments: todayAppointments.length,
      assignedPatients: assignedPatients.length,
      // Add nurse-specific metrics (e.g., "medicationsAdministered")
    };

    return sendResponse(res, 200, "Nurse dashboard data fetched", responseData);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};
// 4. Get Appointments for a Nurse
const getAllPatientAppointment = async (req, res) => {
  try {
    if (!req.params?.nurseId) { // Changed to nurseId
      return sendResponse(res, 400, "Nurse ID is required!");
    }

    let { status, time, startDate, endDate } = req.query;
    let queryParam = { refNurse: req.params?.nurseId }; // Changed to refNurse

    // Rest of the logic remains the same (filter by date/status)
    // ...

    let appointments = await PatientAppointment.find(queryParam)
      .populate("patientId")
      .exec();

    return sendResponse(res, 200, "Nurse appointments fetched", appointments);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};
// GET
const getAvailabilityDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    const nurse = await nurseProfile.findById(user.profile);
    if (!nurse) {
      return sendResponse(res, 404, "Nurse profile not found");
    }

    return sendResponse(res, 200, "Availability details fetched", {
      twentyFourHour: nurse.availabilityDetails?.twentyFourHour || false,
      readyForTravel: nurse.availabilityDetails?.readyForTravel || false,
      price: nurse.availabilityDetails?.price || 0,
      weeklySchedule: nurse.availabilityDetails?.weeklySchedule || {}
    });
  } catch (error) {
    return handleingError(res, error);
  }
};

const updateAvailabilityDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return sendResponse(res, 404, "User not found");

    const nurse = await nurseProfile.findById(user.profile);
    if (!nurse) return sendResponse(res, 404, "Nurse profile not found");

    const { twentyFourHour, readyForTravel, price, weeklySchedule } = req.body;

    nurse.availabilityDetails = {
      twentyFourHour: twentyFourHour || false,
      readyForTravel: readyForTravel || false,
      price: price || 0,
      weeklySchedule: weeklySchedule || {}
    };

    await nurse.save();

    return sendResponse(res, 200, "Availability updated", nurse.availabilityDetails);
  } catch (error) {
    return handleingError(res, error);
  }
};

const updateWardAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return sendResponse(res, 404, "User not found");

    const nurse = await nurseProfile.findById(user.profile);
    if (!nurse) return sendResponse(res, 404, "Nurse profile not found");

    const { wardName, floor, morning, evening, day } = req.body;
    const currentSchedule = nurse.availabilityDetails?.weeklySchedule || {};

    nurse.availabilityDetails = {
      ...nurse.availabilityDetails,
      wardName: wardName || nurse.availabilityDetails.wardName || "General Ward",
      floor: floor || nurse.availabilityDetails.floor || "2",
      weeklySchedule: {
        ...currentSchedule,
        [day]: {
          morning: morning || "",
          evening: evening || ""
        }
      }
    };

    await nurse.save();
    return sendResponse(res, 200, "Ward & availability updated", nurse.availabilityDetails);
  } catch (error) {
    return handleingError(res, error);
  }
};


// 5. Remove Doctor-Specific Functions
// - Delete `getDoctorClinic` (nurses don't manage clinics)
// - Keep `getAppointmentsCountForAllStatuses` if needed (update refDoctor → refNurse)
// - Remove `startCall`, `generateToken` unless nurses need video calls



module.exports = {
  updateProfile,
  getAllNurses,
  getAllPatientAppointment,
  getNurseDashboardData,
  updateAvailability ,
  getAvailabilityDetails,
  updateAvailabilityDetails,
  updateWardAvailability,
  getNurseprofile
};