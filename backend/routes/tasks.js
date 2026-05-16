const express = require("express");
const { body, validationResult } = require("express-validator");
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// ── GET /api/tasks ────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Task.countDocuments(filter);

    res.json({ tasks, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 100 }),
    body("status").optional().isIn(["todo", "in-progress", "done"]),
    body("priority").optional().isIn(["low", "medium", "high"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const task = await Task.create({ ...req.body, user: req.user._id });
      res.status(201).json({ task });
    } catch (err) {
      res.status(500).json({ error: "Failed to create task" });
    }
  }
);

// ── PUT /api/tasks/:id ────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
