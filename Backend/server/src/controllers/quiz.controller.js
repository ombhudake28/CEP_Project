const quizData = require('../data/quiz.json');

const getQuiz = (req, res) => {
  const lang = req.lang;
  const quiz = quizData[lang] || quizData['en'];
  
  res.json({ data: quiz });
};

module.exports = { getQuiz };
