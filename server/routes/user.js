const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");
const router = express.Router();


const getUserFilePath = (username) =>
  path.join(__dirname, "../data", `${username}.json`);

// Validate the structure of a task based on TaskInput.jsx
const validateTask = (task) => {
  if (
    typeof task.text !== "string" ||
    !task.text.trim() ||
    !Number.isInteger(task.duration) ||
    task.duration <= 0 ||
    typeof task.startTime !== "string" ||
    !/^\d{2}:\d{2}$/.test(task.startTime) ||
    typeof task.fixed !== "boolean" ||
    typeof task.skippable !== "boolean" ||
    typeof task.completed !== "boolean"
  ) {
    return false;
  }
  return true;
};

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
  const tasks = req.body;
  if (!Array.isArray(tasks) || !tasks.every(validateTask)) {
    return res.status(400).json({ message: "Invalid task data" });
  }

  const filePath = getUserFilePath(req.user.name);
  try {
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
    res.json({ message: "Tasks saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save user data" });
  }
});

module.exports = router;
