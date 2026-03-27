const jwt = require('jsonwebtoken');
const { readDB } = require('./db');

const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = readDB('users');
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token yaroqsiz yoki muddati tugagan' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Faqat admin uchun' });
};

module.exports = { protect, adminOnly };
