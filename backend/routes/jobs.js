const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getFeaturedJobs,
  toggleJobStatus,
  getRecommendedJobs
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const { validateJob } = require('../middleware/validation');

// Public routes
router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/:id', getJob);

// Protected routes
router.use(protect);

// Job seeker routes
router.get('/recommended/for-you', authorize('jobseeker'), getRecommendedJobs);

// Employer routes
router.get('/employer/my-jobs', authorize('employer'), getEmployerJobs);
router.post('/', authorize('employer'), validateJob, createJob);
router.put('/:id', authorize('employer'), validateJob, updateJob);
router.put('/:id/toggle-status', authorize('employer'), toggleJobStatus);
router.delete('/:id', authorize('employer'), deleteJob);

module.exports = router;