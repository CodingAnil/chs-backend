const express = require("express");
const router = express.Router();

// const { upload } = require("../middlewares/multerS3");
const { checkAuth } = require("../middlewares/auth");
const {
  updateProfile,
  getAllDoctors,
  getAllPatientAppointment,
  getDoctorClinic,
  getDoctorDashboardData,
  getAllPatientsWithAppointmentDetails,
  getAppointmentsCountForAllStatuses,
  startCall,
  generateToken,
} = require("../controllers/doctor");
const { analyzePatientReport } = require("../controllers/symptoms");

router.put("/:userId", checkAuth, updateProfile);
router.get("/appointment-count/:doctorId", getAppointmentsCountForAllStatuses);
router.get("/appointment/:doctorId", getAllPatientAppointment);
router.get("/patient/:doctorId", getAllPatientsWithAppointmentDetails);
router.get("/dashboard/:doctorId", getDoctorDashboardData);
router.get("/clinic/:doctorId", getDoctorClinic);

router.get("/list", getAllDoctors);

router.post("/symptom-analyser", analyzePatientReport);
router.post("/call/start", startCall);
router.post('/token', generateToken);

module.exports = router;
