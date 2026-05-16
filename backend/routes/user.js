const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.put(
  "/profile",
  [body("name").optional().trim().isLength({ min: 2, max: 50 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const allowed = ["name", "avatar"];
      const updates = {};
      allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

module.exports = router;
