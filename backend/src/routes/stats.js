const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats/overview
router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      highPriorityTasks,
      recentTasks,
      tasksByDay
    ] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: 'completed' }),
      Task.countDocuments({ user: userId, status: 'in-progress' }),
      Task.countDocuments({ user: userId, status: 'todo' }),
      Task.countDocuments({ user: userId, priority: 'high', status: { $ne: 'completed' } }),
      Task.find({ user: userId }).sort('-createdAt').limit(5).select('title status priority createdAt'),
      Task.aggregate([
        { $match: { user: userId, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }},
        { $sort: { '_id': 1 } }
      ])
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalTasks, completedTasks, inProgressTasks, todoTasks,
        highPriorityTasks, completionRate, recentTasks, tasksByDay
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

module.exports = router;
