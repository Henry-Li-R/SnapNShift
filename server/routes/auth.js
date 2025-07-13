// server/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { addUser, getUser } = require('../utils/userStore');
const authenticateToken = require('../middleware/auth');
const prisma = require('../prisma');
require('dotenv').config();

const router = express.Router();

router.get('/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

router.post('/register', async (req, res) => {
    const email = req.body.email?.trim();
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    // email validation?

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        }
    });

    const user = { id: newUser.id, email };
    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    return res.status(201).json({ token });
});

router.post('/login', async (req, res) => {
    const email = req.body.email?.trim();
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    // email validation?

    const storedUser = await prisma.user.findUnique({ where: { email } });
    if (!storedUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, storedUser.password);
    if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }


    const user = { id: storedUser.id, email };
    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    return res.status(200).json({ token });
});

module.exports = router;