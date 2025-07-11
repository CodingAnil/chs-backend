const express = require("express");
const router = express.Router();
const {
  getPathologyLabProfile,
  updatePathologyLabProfile,
} = require("../controllers/pathologyController");

// Get lab profile
router.get("/:id", getPathologyLabProfile);

// Update lab profile
router.put("/:id", updatePathologyLabProfile);

module.exports = router;
