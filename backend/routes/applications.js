const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus,
  addEmployerNotes,
  withdrawApplication,
  getAllEmployerApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { validateApplication } = require('../middleware/validation');
const { uploadResume, handleMulterError } = require('../middleware/upload');

// Protected routes - all require authentication
router.use(protect);

// Job seeker routes
router.post('/', uploadResume.single('resume'), handleMulterError, validateApplication, applyForJob);
router.get('/my-applications', authorize('jobseeker'), getMyApplications);
router.delete('/:id', authorize('jobseeker'), withdrawApplication);

// Employer routes
router.get('/employer/all', authorize('employer'), getAllEmployerApplications);
router.get('/employer/:jobId', authorize('employer'), getJobApplications);
router.put('/:id/status', authorize('employer'), updateApplicationStatus);
router.put('/:id/notes', authorize('employer'), addEmployerNotes);

// Common routes (accessible by application owner or job poster)
router.get('/:id', getApplication);

module.exports = router;