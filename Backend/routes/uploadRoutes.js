const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getUploadStatus, uploadProductImage } = require('../controllers/uploadController');

const router = express.Router();

router.get('/status', getUploadStatus);
router.post('/', protect, admin, upload.single('image'), uploadProductImage);

module.exports = router;
