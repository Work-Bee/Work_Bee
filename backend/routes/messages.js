const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// All routes protected; participants only
router.get('/:applicationId', protect, messageController.getMessages);
router.post('/:applicationId', protect, messageController.postMessage);
router.delete('/:messageId', protect, messageController.deleteMessage);

module.exports = router;
