const express = require('express');
const router = express.Router();
const {
  createCompany,
  getCompany,
  updateCompany,
  getCompanies,
  getMyCompany
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');
const { validateCompany } = require('../middleware/validation');

// Public routes
router.get('/', getCompanies);
router.get('/:id', getCompany);

// Protected routes
router.use(protect);

// Employer routes
router.get('/profile/my-company', authorize('employer'), getMyCompany);
router.post('/', authorize('employer'), validateCompany, createCompany);
router.put('/:id', authorize('employer'), validateCompany, updateCompany);

module.exports = router;