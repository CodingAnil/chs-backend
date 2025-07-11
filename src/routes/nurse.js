const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController'); // Adjust the path as needed

// Example PUT route for updating a profile
router.put('/update-profile', nurseController.updateProfile); 

// Example GET route for fetching all nurses
router.get('/all-nurses', nurseController.getAllNurses);

// Example GET route for nurse dashboard data
router.get('/dashboard', nurseController.getNurseDashboardData);
router.put('/:userId/availability', nurseController.updateAvailability);
router.put('/:userId/availability-details', nurseController.updateAvailabilityDetails);
router.get('/:userId/availability-details', nurseController.getAvailabilityDetails);


// Update nurse profile
router.get('/:userId', nurseController.getAllNurses);// <-- required
router.put('/:userId', nurseController.updateProfile);// <-- required
// update ward
router.put('/nurse/:userId/ward-availability', nurseController.updateWardAvailability);
router.put('/:userId/ward-availability', nurseController.updateWardAvailability);



module.exports = router;
