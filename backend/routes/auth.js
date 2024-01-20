require('dotenv').config();
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE: 1 - Create a User using: POST "/api/auth/register". No Login Required
router.post('/register', [
    body('username', 'Enter a valid Username').isLength({ min: 3 }),
    body('firstName', 'Enter a valid First Name').isLength({ min: 3 }),
    body('lastName', 'Enter a valid Last Name').isLength({ min: 3 }),
    body('email', 'Enter a valid E-mail').isEmail(),
    body('password', 'Password must have a minimum of 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if the username is already taken
        const existingUsername = await User.findOne({ username: req.body.username });
        if (existingUsername) {
            return res.status(400).json({ error: 'This username is already taken.' });
        }

        // Check if the email is already registered
        const existingEmail = await User.findOne({ email: req.body.email });
        if (existingEmail) {
            return res.status(400).json({ error: 'This email is already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(req.body.password, salt);

        // Creates a new user
        const user = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: securePassword,
        });
        await user.save();

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);

        res.json({ authToken });
        // res.json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ROUTE: 2 - Authenticate a User using: POST "/api/auth/login". No Login Required
router.post('/login', [
    body('email', 'Enter a valid E-mail').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        // Check if the User with the email exists or not
        const existingUser = await User.findOne({ email: req.body.email });
        if (!existingUser) {
            return res.status(400).json({ error: 'Sorry a User with this E-mail does not Exists!' });
        }

        const verifyPassword = await bcrypt.compare(password, existingUser.password);
        if (!verifyPassword) {
            return res.status(400).json({ error: 'Please try to login with correct credentials' });
        }

        const data = {
            user: {
                id: existingUser.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ authToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

// ROUTE: 3 - Get User Details using: POST "/api/auth/getuser". Login Required
router.post('/getuser', fetchuser, async (req, res) => {

    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
