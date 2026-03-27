const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Ma'lumotlar papkasini yaratish
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/quiz', require('./routes/quiz'));
app.use('/admin', require('./routes/admin'));
app.use('/leaderboard', require('./routes/leaderboard'));

app.get('/', (req, res) => res.json({ message: '✅ QuizApp API ishlayapti!' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server xatosi' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT}-portda ishlamoqda`);
  console.log(`📁 Ma'lumotlar: ${dataDir}`);
  console.log(`🌐 http://localhost:${PORT}`);
});
