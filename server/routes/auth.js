// server/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { addUser, getUser } = require('../utils/userStore');
const authenticateToken = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

router.get('/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

router.post('/register', async (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    const isValidUsername = /^[a-zA-Z0-9_-]{3,20}$/.test(username);
    if (!isValidUsername) {
        return res.status(400).json({ message: 'Invalid username format' });
    }

    if (getUser(username)) {
        return res.status(409).json({ message: 'User already exists' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    addUser(username, hashedPassword);

    const user = { name: username };
    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    return res.status(201).json({ token });
});

router.post('/login', async (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    const isValidUsername = /^[a-zA-Z0-9_-]{3,20}$/.test(username);
    if (!isValidUsername) {
        return res.status(400).json({ message: 'Invalid username format.\nAccepted format: 3–20 characters, only letters, numbers, underscores, or dashes.' });
    }

    const storedUser = getUser(username);
    if (!storedUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, storedUser.passwordHash);
    if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }


    const user = { name: username };
    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    return res.status(200).json({ token });
});

module.exports = router;