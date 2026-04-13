const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// Single image upload (protected)
router.post('/image', protect, uploadController.upload.single('image'), uploadController.uploadImage);

// Multiple image upload (protected)
router.post('/images', protect, uploadController.uploadMultipleImages, uploadController.handleMultipleUploads);

// Delete uploaded file (protected)
router.delete('/file/:filename', protect, uploadController.deleteFile);

module.exports = router;