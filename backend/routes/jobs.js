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
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware: set req.user if token present and valid; otherwise continue
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (e) {
    // ignore auth errors to keep route public
  }
  next();
};

// Public routes
router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/:id', optionalAuth, getJob);

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