const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.cjs');

router.post('/seed', adminController.seed);

module.exports = router;
