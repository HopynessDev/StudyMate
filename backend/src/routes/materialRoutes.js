const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.post('/generate', protect, materialController.extractAndGenerate);
router.get('/', protect, materialController.getMaterials);
router.get('/subjects', protect, materialController.getSubjects);
router.get('/:id', protect, materialController.getMaterial);
router.put('/:id', protect, materialController.updateMaterial);
router.put('/:id/progress', protect, materialController.updateProgress);
router.delete('/:id', protect, materialController.deleteMaterial);

module.exports = router;