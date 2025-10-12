const express = require('express');
const router = express.Router();
const {
  getSavedFilters,
  getSavedFilter,
  createSavedFilter,
  updateSavedFilter,
  deleteSavedFilter
} = require('../controllers/savedFilterController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and jobseeker role
router.use(protect);
router.use(authorize('jobseeker'));

router.route('/')
  .get(getSavedFilters)
  .post(createSavedFilter);

router.route('/:id')
  .get(getSavedFilter)
  .patch(updateSavedFilter)
  .delete(deleteSavedFilter);

module.exports = router;
