const express = require('express');
const router = express.Router();
const wellnessController = require('../controllers/wellnessController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.post('/record', protect, wellnessController.recordWellness);
router.get('/history', protect, wellnessController.getWellnessHistory);
router.get('/trends', protect, wellnessController.getWellnessTrends);
router.get('/relaxation', protect, wellnessController.getRelaxationContent);
router.get('/resources', protect, wellnessController.getMentalHealthResources);

module.exports = router;