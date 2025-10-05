const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  addBookmark,
  removeBookmark,
  getBookmarks,
  checkBookmark
} = require('../controllers/bookmarkController');

// All routes require authentication and jobseeker role
router.use(protect);
router.use(authorize('jobseeker'));

router.route('/')
  .get(getBookmarks)
  .post(addBookmark);

router.route('/:jobId')
  .delete(removeBookmark);

router.route('/check/:jobId')
  .get(checkBookmark);

module.exports = router;
