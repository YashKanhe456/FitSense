const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.route('/').get(getUsers);
router.route('/:id').get(getUserById);

module.exports = router;
