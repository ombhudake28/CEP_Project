const express = require('express');
const { getAllScams, getScamBySlug } = require('../controllers/scams.controller');

const router = express.Router();

router.get('/', getAllScams);
router.get('/:slug', getScamBySlug);

module.exports = router;
