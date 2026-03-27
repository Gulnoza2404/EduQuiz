const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../middleware/db');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /admin/users - barcha foydalanuvchilar (parol hash bilan)
router.get('/users', (req, res) => {
  try {
    const users = readDB('users').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /admin/stats
router.get('/stats', (req, res) => {
  try {
    const users = readDB('users');
    const quizzes = readDB('quizzes');
    const scores = readDB('scores');

    const topScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json({
      totalUsers: users.length,
      totalQuizzes: quizzes.length,
      totalPlays: scores.length,
      topScores,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /admin/quizzes
router.get('/quizzes', (req, res) => {
  try {
    const quizzes = readDB('quizzes').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /admin/users/:id
router.delete('/users/:id', (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: 'O\'z hisobingizni o\'chira olmaysiz' });
    const users = readDB('users');
    if (!users.find(u => u.id === req.params.id))
      return res.status(404).json({ message: 'Topilmadi' });
    writeDB('users', users.filter(u => u.id !== req.params.id));
    res.json({ message: 'Foydalanuvchi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /admin/users/:id/role
router.put('/users/:id/role', (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ message: 'Noto\'g\'ri rol' });
    const users = readDB('users');
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Topilmadi' });
    users[idx].role = role;
    writeDB('users', users);
    res.json({ user: users[idx] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
