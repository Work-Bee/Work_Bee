const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard,
  getUsers,
  getJobs,
  getApplications
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getDashboard);
router.get('/users', getUsers);
router.get('/jobs', getJobs);
router.get('/applications', getApplications);

module.exports = router;
