const express = require('express');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/auth');

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/public', (req, res) => {
    res.send('Anyone can access this.');
});

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.send(`Hello ${req.user.name}, you accessed a protected route.`);
});

app.listen(process.env.PORT || 3001, () => {
    console.log(`Server running on port ${process.env.PORT || 3001}`);
});