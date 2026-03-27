const express = require('express');
const router = express.Router();
const { readDB } = require('../middleware/db');

// GET /leaderboard/global
router.get('/global', (req, res) => {
  try {
    const users = readDB('users')
      .map(u => ({
        id: u.id,
        username: u.username,
        totalScore: u.totalScore || 0,
        quizzesPlayed: u.quizzesPlayed || 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 20);
    res.json({ leaders: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /leaderboard/quiz/:quizId
router.get('/quiz/:quizId', (req, res) => {
  try {
    const scores = readDB('scores')
      .filter(s => s.quizId === req.params.quizId)
      .sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken)
      .slice(0, 10);
    res.json({ scores });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
