const express = require("express");
const router = express.Router();
const twilioController = require("../controllers/contact");

// Generate token
router.get("/token", twilioController.generateToken);
router.post("/token", twilioController.generateToken);

// Voice TwiML endpoint
router.post("/voice", twilioController.handleVoiceCall);

module.exports = router;