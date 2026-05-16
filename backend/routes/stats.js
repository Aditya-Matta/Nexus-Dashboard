const express = require("express");
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const userId = req.user._id;

    const [total, todo, inProgress, done] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: "todo" }),
      Task.countDocuments({ user: userId, status: "in-progress" }),
      Task.countDocuments({ user: userId, status: "done" }),
    ]);

    const recent = await Task.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status priority createdAt");

    res.json({ total, todo, inProgress, done, recent });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
