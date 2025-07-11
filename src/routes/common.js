const express = require("express");
const router = express.Router();

// const { upload } = require("../middlewares/multerS3");
const { checkAuth } = require("../middlewares/auth");
const commonController = require("../controllers/commonController");

router.get("/doctorandnurse/list", commonController.getAllDoctorsAndNurses);

// Nurse profile routes
router.get("/nurse/profile/:nurseId", commonController.getNurseProfileWithDashboard);
router.put("/nurse/profile/:nurseId", commonController.updateNurseProfile);

module.exports = router;