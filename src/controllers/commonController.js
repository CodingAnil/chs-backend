const User = require("../models/user");
const nurseProfile = require("../models/nurseProfile");
const PatientAppointment = require("../models/userAppointment");

const {
  sendResponse,
  handleingError,
  capitalizeFirstLetter,
} = require("../utils");

const getAllDoctorsAndNurses = async (req, res) => {
  try {
    // Fetch all doctors
    const doctors = await User.find({ role: "Doctor" }).populate("profile");
    // Fetch all nurses (role could be 'Nurse' or 'Nursing', check your DB)
    const nurses = await User.find({ role: { $in: ["Nurse", "Nursing","Pathology"] } }).populate("profile");
    res.status(200).json({
      doctors,
      nurses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get comprehensive nurse profile with dashboard data
const getNurseProfileWithDashboard = async (req, res) => {
  try {
    const nurseId = req.params?.nurseId || req.params?.userId;

    if (!nurseId) {
      return sendResponse(res, 400, "Nurse ID is required!");
    }

    // Get nurse user and profile
    const nurseUser = await User.findById(nurseId);
    if (!nurseUser) {
      return sendResponse(res, 404, "Nurse not found");
    }

    const nurseProfileData = await nurseProfile.findById(nurseUser.profile);
    if (!nurseProfileData) {
      return sendResponse(res, 404, "Nurse profile not found");
    }

    // Get dashboard data
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    // Query for today's appointments assigned to the nurse
    const todayAppointments = await PatientAppointment.find({
      refNurse: nurseId,
      date: { $gte: startOfToday, $lte: endOfToday },
    }).populate("patientId");

    // Count patients assigned to the nurse
    const assignedPatients = await PatientAppointment.find({
      refNurse: nurseId,
    }).distinct("patientId");

    // Get all appointments for the nurse
    const allAppointments = await PatientAppointment.find({
      refNurse: nurseId,
    }).populate("patientId").sort({ date: -1 }).limit(10);

    // Calculate statistics
    const totalAppointments = await PatientAppointment.countDocuments({ refNurse: nurseId });
    const completedAppointments = await PatientAppointment.countDocuments({ 
      refNurse: nurseId, 
      status: "Completed" 
    });
    const pendingAppointments = await PatientAppointment.countDocuments({ 
      refNurse: nurseId, 
      status: "Pending" 
    });

    const dashboardData = {
      todayAppointments: todayAppointments.length,
      assignedPatients: assignedPatients.length,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      recentAppointments: allAppointments,
      completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(2) : 0
    };

    const responseData = {
      user: {
        _id: nurseUser._id,
        name: nurseUser.name,
        email: nurseUser.email,
        role: nurseUser.role,
        profile: nurseProfileData
      },
      dashboard: dashboardData
    };

    return sendResponse(res, 200, "Nurse profile with dashboard data fetched successfully", responseData);
  } catch (error) {
    return handleingError(res, error);
  }
};

// Update nurse profile with comprehensive data
const updateNurseProfile = async (req, res) => {
  try {
    const nurseId = req.params?.nurseId || req.params?.userId;
    const user = await User.findById(nurseId);
    
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    const profileId = user.profile;
    if (!profileId) {
      return sendResponse(res, 400, "Profile id is required");
    }

    const updateFields = {};
    const updateUserFields = {};

    const {
      firstName,
      lastName,
      displayName,
      designation,
      email,
      phoneNumber,
      availability,
      languages,
      country,
      state,
      city,
      address,
      qualifications,
      skills,
      documents,
      availabilityDetails
    } = req.body;

    // Update profile fields
    if (firstName) {
      updateFields.firstName = capitalizeFirstLetter(firstName);
      updateUserFields.name = capitalizeFirstLetter(firstName);
    }
    if (lastName) updateFields.lastName = capitalizeFirstLetter(lastName);
    if (displayName) updateFields.displayName = displayName;
    if (designation) updateFields.designation = capitalizeFirstLetter(designation);
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (email) {
      updateFields.email = email.toLowerCase();
      updateUserFields.email = email.toLowerCase();
    }
    if (languages) updateFields.languages = languages;
    if (country) updateFields.country = country;
    if (state) updateFields.state = state;
    if (city) updateFields.city = city;
    if (address) updateFields.address = address;
    if (availability !== undefined) updateFields.availability = availability;
    if (qualifications) updateFields.qualifications = qualifications;
    if (skills) updateFields.skills = skills;
    if (documents) updateFields.documents = documents;
    if (availabilityDetails) updateFields.availabilityDetails = availabilityDetails;

    // Update user fields if needed
    if (Object.keys(updateUserFields).length > 0) {
      await User.findByIdAndUpdate(user._id, updateUserFields, { new: true });
    }

    // Update nurse profile
    const updatedNurse = await nurseProfile.findByIdAndUpdate(
      profileId,
      updateFields,
      { new: true }
    );

    if (!updatedNurse) {
      return sendResponse(res, 404, "Nurse profile not found");
    }

    return sendResponse(res, 200, "Nurse profile updated successfully", updatedNurse);
  } catch (error) {
    return handleingError(res, error);
  }
};

module.exports = {
  getAllDoctorsAndNurses,
  getNurseProfileWithDashboard,
  updateNurseProfile,
}; 