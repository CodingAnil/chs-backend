const twilio = require("twilio");
const VoiceResponse = twilio.twiml.VoiceResponse;
require("dotenv").config();

const generateToken = (req, res) => {
  try {
    // Get user identity from request or generate a random one
    const identity =
      req.query.identity ||
      req.body.identity ||
      "user" + Math.random().toString(36).substring(2, 15);

    // Create an access token
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Create a new access token
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity: identity, ttl: 3600 }
    );

    // Create a Voice grant and add it to the token
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });
    token.addGrant(voiceGrant);

    // Return the token
    res.json({
      token: token.toJwt(),
      identity: identity,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: error.message });
  }
};

const handleVoiceCall = (req, res) => {
  const twiml = new VoiceResponse();
  
  // Get the recipient from the request
  const to = req.body.To;
  const from = req.body.From;
  
  // If the request contains a To parameter, it's an outbound call
  if (to) {
    // Create a <Dial> element
    const dial = twiml.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER,
    });
    
    // If the To parameter is a phone number, dial it
    if (to.match(/^\+?[1-9]\d{1,14}$/)) {
      dial.number(to);
    } else {
      // Otherwise, assume it's a client identifier
      dial.client(to);
    }
  } else {
    // If there's no To parameter, it's an incoming call
    twiml.say('Thank you for calling. Please wait while we connect you.');
    
    // Connect to the first available client
    const dial = twiml.dial();
    dial.client('browser');
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
};

module.exports = {
  generateToken,
  handleVoiceCall,
};