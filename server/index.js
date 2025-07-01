const express = require('express');
require('dotenv').config();
const cors = require("cors");
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/auth');
const userRoutes = require('./routes/user');

const app = express();
// Allow CORS for dynamic origin with credentials support
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_ORIGIN,
            "http://localhost:5173",
            "https://snap-n-shift-git-production-debug-henry-lis-projects-6da959dc.vercel.app"
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// Handle preflight requests properly
app.options("*", cors(corsOptions));
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.get('/public', (req, res) => {
    res.send('Anyone can access this.');
});

// Protected route example usage
/*
app.get('/analytics', authenticateToken, (req, res) => {
    // Load user-specific analytics
    res.json({ user: req.user.name, data:  ...  });
});

app.get('/profile', authenticateToken, (req, res) => {
    // Return personal info
    res.json({ name: req.user.name, joined: '2025-06-25' });
});
*/

app.listen(process.env.PORT || 3001, () => {
    console.log(`Server running on port ${process.env.PORT || 3001}`);
});