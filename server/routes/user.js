const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");
const prisma = require("../prisma");

const router = express.Router();

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

router.get("/tasks", authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { startTime: "asc" },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

router.post("/tasks", authenticateToken, async (req, res) => {
  const tasks = req.body;
  if (!Array.isArray(tasks) || !tasks.every(validateTask)) {
    return res.status(400).json({ message: "Invalid task data" });
  }

  try {
    // Delete all previous tasks of the user
    await prisma.task.deleteMany({ where: { userId: req.user.id } });
    // Create new tasks
    const newTasks = await Promise.all(
      tasks.map((task) =>
        prisma.task.create({
          data: {
            ...task,
            userId: req.user.id,
          },
        })
      )
    );

    res.json({ message: "Tasks saved successfully", tasks: newTasks });
  } catch (err) {
    res.status(500).json({ message: "Failed to save tasks" });
  }
});

module.exports = router;
