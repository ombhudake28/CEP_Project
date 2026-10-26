const express = require('express');
const { getQuiz } = require('../controllers/quiz.controller');

const router = express.Router();

router.get('/', getQuiz);

module.exports = router;
