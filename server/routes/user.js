const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

const getUserFilePath = (username) =>
  path.join(__dirname, "../data", `${username}.json`);

router.get("/tasks", authenticateToken, (req, res) => {
  const filePath = getUserFilePath(req.user.name);
  if (!fs.existsSync(filePath)) {
    return res.json([]);
  }

  try {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ message: "Failed to read user data" });
  }
});

router.post("/tasks", authenticateToken, (req, res) => {
  const filePath = getUserFilePath(req.user.name);
  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body || [], null, 2));
    res.json({ message: "Tasks saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save user data" });
  }
});

module.exports = router;
