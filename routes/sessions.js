const express = require('express');

const sessionController = require('../controllers/sessionController');

const router = express.Router();

router.post('/login', sessionController.login);
router.get('/logout', sessionController.logout);

module.exports = router;
