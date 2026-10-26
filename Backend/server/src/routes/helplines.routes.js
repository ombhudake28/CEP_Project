const express = require('express');
const { getHelplines } = require('../controllers/helplines.controller');

const router = express.Router();

router.get('/', getHelplines);

module.exports = router;
