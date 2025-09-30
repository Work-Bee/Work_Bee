const { validationResult } = require('express-validator');
const Company = require('../models/Company');
const User = require('../models/User');

// @desc    Create company profile
// @route   POST /api/companies
// @access  Private (Employers only)
const createCompany = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Only employers can create company profiles'
      });
    }

    // Check if user already has a company
    if (req.user.company) {
      return res.status(400).json({
        success: false,
        error: 'You already have a company profile'
      });
    }

    // Add owner to company data
    req.body.owner = req.user.id;

    const company = await Company.create(req.body);

    // Update user's company reference
    await User.findByIdAndUpdate(req.user.id, { company: company._id });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating company'
    });
  }
};

// @desc    Get company profile
// @route   GET /api/companies/:id
// @access  Public
const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('owner', 'name email');

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error getting company'
    });
  }
};

// @desc    Update company profile
// @route   PUT /api/companies/:id
// @access  Private (Company owner only)
const updateCompany = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Check if user owns the company
    if (company.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this company'
      });
    }

    // Don't allow changing owner
    delete req.body.owner;

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating company'
    });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by industry
    if (req.query.industry) {
      query.industry = req.query.industry;
    }

    // Filter by size
    if (req.query.size) {
      query.size = req.query.size;
    }

    // Filter by location
    if (req.query.city) {
      query['location.city'] = new RegExp(req.query.city, 'i');
    }

    const companies = await Company.find(query)
      .select('-owner')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Company.countDocuments(query);

    res.json({
      success: true,
      count: companies.length,
      total,
      data: companies
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting companies'
    });
  }
};

// @desc    Get my company
// @route   GET /api/companies/my-company
// @access  Private (Employers only)
const getMyCompany = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Only employers can access company profiles'
      });
    }

    if (!req.user.company) {
      return res.status(404).json({
        success: false,
        error: 'No company profile found'
      });
    }

    const company = await Company.findById(req.user.company);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get my company error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting company'
    });
  }
};

module.exports = {
  createCompany,
  getCompany,
  updateCompany,
  getCompanies,
  getMyCompany
};