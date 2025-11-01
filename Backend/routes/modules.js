const express = require('express');
const { getModules } = require('../controllers/modulesController');

const router = express.Router();

// @route   GET /api/modules
// @desc    Get gamified modules metadata (static)
// @access  Public
router.get('/', getModules);

module.exports = router;


