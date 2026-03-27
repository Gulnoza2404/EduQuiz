const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../middleware/db');
const { protect } = require('../middleware/auth');

// POST /quiz/create
router.post('/create', protect, (req, res) => {
  try {
    const { title, description, category, difficulty, timeLimit, questions } = req.body;
    if (!title || !title.trim())
      return res.status(400).json({ message: 'Sarlavha kiritilishi shart' });
    if (!questions || questions.length < 1)
      return res.status(400).json({ message: 'Kamida 1 ta savol bo\'lishi kerak' });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.question.trim())
        return res.status(400).json({ message: `${i + 1}-savol matni bo'sh` });
      if (!q.options || q.options.length !== 4 || q.options.some(o => !o.trim()))
        return res.status(400).json({ message: `${i + 1}-savolda to'liq 4 ta variant bo'lishi kerak` });
      if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3)
        return res.status(400).json({ message: `${i + 1}-savolda to'g'ri javob belgilanmagan` });
    }

    const quizzes = readDB('quizzes');
    const newQuiz = {
      id: uuidv4(),
      title: title.trim(),
      description: description || '',
      category: category || 'Umumiy',
      difficulty: difficulty || 'O\'rta',
      timeLimit: timeLimit || 30,
      questions,
      createdBy: req.user.id,
      createdByUsername: req.user.username,
      plays: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
    };

    quizzes.push(newQuiz);
    writeDB('quizzes', quizzes);

    // Update user stats
    const users = readDB('users');
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx !== -1) {
      users[idx].quizzesCreated = (users[idx].quizzesCreated || 0) + 1;
      writeDB('users', users);
    }

    res.status(201).json({ quiz: newQuiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /quiz/list
router.get('/list', (req, res) => {
  try {
    const { search, category, difficulty, page = 1, limit = 12 } = req.query;
    let quizzes = readDB('quizzes');

    if (search) quizzes = quizzes.filter(q => q.title.toLowerCase().includes(search.toLowerCase()));
    if (category && category !== 'Hammasi') quizzes = quizzes.filter(q => q.category === category);
    if (difficulty && difficulty !== 'Hammasi') quizzes = quizzes.filter(q => q.difficulty === difficulty);

    quizzes = quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = quizzes.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const sliced = quizzes.slice(start, start + Number(limit));

    // Hide correct answers from list
    const safe = sliced.map(q => ({
      ...q,
      questions: q.questions.map(({ correctAnswer, explanation, ...rest }) => rest),
    }));

    res.json({ quizzes: safe, total, page: Number(page), pages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /quiz/my
router.get('/my', protect, (req, res) => {
  try {
    const quizzes = readDB('quizzes').filter(q => q.createdBy === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /quiz/:id
router.get('/:id', (req, res) => {
  try {
    const quiz = readDB('quizzes').find(q => q.id === req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz topilmadi' });

    const safe = {
      ...quiz,
      questions: quiz.questions.map(({ correctAnswer, explanation, ...rest }) => rest),
    };
    res.json({ quiz: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /quiz/play - javoblarni tekshirish
router.post('/play', protect, (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const quizzes = readDB('quizzes');
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz topilmadi' });

    let correct = 0;
    const results = quiz.questions.map((q, i) => {
      const selected = answers[i] !== undefined ? answers[i] : -1;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correct++;
      return {
        question: q.question,
        options: q.options,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || '',
      };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);

    // Save score
    const scores = readDB('scores');
    const newScore = {
      id: uuidv4(),
      userId: req.user.id,
      username: req.user.username,
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers: correct,
      timeTaken: timeTaken || 0,
      createdAt: new Date().toISOString(),
    };
    scores.push(newScore);
    writeDB('scores', scores);

    // Update quiz plays & avg score
    const qi = quizzes.findIndex(q => q.id === quizId);
    quizzes[qi].plays += 1;
    quizzes[qi].averageScore = Math.round(
      ((quizzes[qi].averageScore * (quizzes[qi].plays - 1)) + score) / quizzes[qi].plays
    );
    writeDB('quizzes', quizzes);

    // Update user stats
    const users = readDB('users');
    const ui = users.findIndex(u => u.id === req.user.id);
    if (ui !== -1) {
      users[ui].quizzesPlayed = (users[ui].quizzesPlayed || 0) + 1;
      users[ui].totalScore = (users[ui].totalScore || 0) + score;
      writeDB('users', users);
    }

    res.json({ results, score, correctAnswers: correct, totalQuestions: quiz.questions.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /quiz/:id
router.put('/:id', protect, (req, res) => {
  try {
    const quizzes = readDB('quizzes');
    const idx = quizzes.findIndex(q => q.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Topilmadi' });
    if (quizzes[idx].createdBy !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Ruxsat yo\'q' });

    const { title, description, category, difficulty, timeLimit, questions } = req.body;
    if (title) quizzes[idx].title = title;
    if (description !== undefined) quizzes[idx].description = description;
    if (category) quizzes[idx].category = category;
    if (difficulty) quizzes[idx].difficulty = difficulty;
    if (timeLimit) quizzes[idx].timeLimit = timeLimit;
    if (questions) quizzes[idx].questions = questions;
    quizzes[idx].updatedAt = new Date().toISOString();

    writeDB('quizzes', quizzes);
    res.json({ quiz: quizzes[idx] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /quiz/:id
router.delete('/:id', protect, (req, res) => {
  try {
    const quizzes = readDB('quizzes');
    const quiz = quizzes.find(q => q.id === req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Topilmadi' });
    if (quiz.createdBy !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Ruxsat yo\'q' });

    writeDB('quizzes', quizzes.filter(q => q.id !== req.params.id));
    res.json({ message: 'Quiz o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
