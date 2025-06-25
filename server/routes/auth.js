// server/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { userExists, addUser } = require('../utils/userStore');
require('dotenv').config();

const router = express.Router();

router.post('/login', (req, res) => {
    const username = req.body.username?.trim();
    if (!username) {
        return res.status(400).json({ message: 'Username required' });
    }

    if (!userExists(username)) {
        return res.status(404).json({ message: 'User not found' });
    }

    const user = { name: username };
    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    return res.status(201).json({ token });
});

router.post('/register', (req, res) => {
    const username = req.body.username?.trim();

    if (!username) {
        return res.status(400).json({ message: 'Username required' });
    }

    if (userExists(username)) {
        return res.status(409).json({ message: 'User already exists' });
    }

    addUser(username);

    const user = { name: username };
    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    return res.status(201).json({ token });
});

module.exports = router;