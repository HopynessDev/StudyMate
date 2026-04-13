const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.post('/sessions', protect, progressController.recordSession);
router.get('/sessions', protect, progressController.getSessions);
router.get('/statistics', protect, progressController.getStatistics);
router.get('/achievements', protect, progressController.getAchievements);
router.get('/goals', protect, progressController.getGoals);
router.post('/goals', protect, progressController.createGoal);
router.put('/goals/:id', protect, progressController.updateGoalProgress);
router.delete('/goals/:id', protect, progressController.deleteGoal);

module.exports = router;