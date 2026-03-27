const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../middleware/db');
const { protect } = require('../middleware/auth');

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => ({
  id: u.id, username: u.username, email: u.email,
  role: u.role, quizzesCreated: u.quizzesCreated || 0,
  quizzesPlayed: u.quizzesPlayed || 0, totalScore: u.totalScore || 0,
  createdAt: u.createdAt,
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || username.length < 3)
      return res.status(400).json({ message: 'Username kamida 3 ta harf bo\'lishi kerak' });
    if (!email || !/\S+@\S+\.\S+/.test(email))
      return res.status(400).json({ message: 'Email noto\'g\'ri' });
    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Parol kamida 6 ta belgi bo\'lishi kerak' });

    const users = readDB('users');

    if (users.find(u => u.email === email.toLowerCase()))
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    if (users.find(u => u.username === username))
      return res.status(400).json({ message: 'Bu username band' });

    const hashed = await bcrypt.hash(password, 12);
    const isAdmin = users.length === 0 || email.toLowerCase() === process.env.ADMIN_EMAIL;

    const newUser = {
      id: uuidv4(),
      username,
      email: email.toLowerCase(),
      password: hashed,
      role: isAdmin ? 'admin' : 'user',
      quizzesCreated: 0,
      quizzesPlayed: 0,
      totalScore: 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeDB('users', users);

    res.status(201).json({ token: makeToken(newUser.id), user: safeUser(newUser) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email va parol kiritilishi shart' });

    const users = readDB('users');
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });

    res.json({ token: makeToken(user.id), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

// PUT /auth/profile
router.put('/profile', protect, (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.length < 3)
      return res.status(400).json({ message: 'Username kamida 3 ta harf' });

    const users = readDB('users');
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'Topilmadi' });

    const conflict = users.find(u => u.username === username && u.id !== req.user.id);
    if (conflict) return res.status(400).json({ message: 'Bu username band' });

    users[idx].username = username;
    writeDB('users', users);
    res.json({ user: safeUser(users[idx]) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const users = readDB('users');
    const idx = users.findIndex(u => u.id === req.user.id);

    const match = await bcrypt.compare(currentPassword, users[idx].password);
    if (!match) return res.status(401).json({ message: 'Joriy parol noto\'g\'ri' });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: 'Yangi parol kamida 6 ta belgi' });

    users[idx].password = await bcrypt.hash(newPassword, 12);
    writeDB('users', users);
    res.json({ message: 'Parol yangilandi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
