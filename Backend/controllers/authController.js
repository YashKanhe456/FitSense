const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const generateToken = require('../utils/generateToken');
const { mapUser } = require('../utils/serializers');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);

    if (existingUser.rows.length > 0) {
        res.status(400);
        throw new Error('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertedUser = await query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, role, created_at, updated_at`,
        [name.trim(), normalizedEmail, hashedPassword]
    );

    const user = mapUser(insertedUser.rows[0]);

    if (user) {
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                ...user,
                token: generateToken(user._id)
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const userResult = await query(
        'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1 LIMIT 1',
        [normalizedEmail]
    );
    const user = userResult.rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
        const safeUser = mapUser(user);
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                ...safeUser,
                token: generateToken(safeUser._id)
            }
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const userResult = await query(
        'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
        [req.user._id]
    );
    const user = userResult.rows[0];

    if (user) {
        const safeUser = mapUser(user);
        res.json({
            success: true,
            data: {
                _id: safeUser._id,
                name: safeUser.name,
                email: safeUser.email,
                role: safeUser.role,
                createdAt: safeUser.createdAt
            }
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { loginUser, registerUser, getUserProfile };
