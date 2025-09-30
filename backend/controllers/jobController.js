const { validationResult } = require('express-validator');
const Job = require('../models/Job');
const Company = require('../models/Company');

// @desc    Get all jobs with search and filtering
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    let query = { isActive: true };
    let sortOptions = { createdAt: -1 };

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by job type
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    // Filter by experience level
    if (req.query.experienceLevel) {
      query.experienceLevel = req.query.experienceLevel;
    }

    // Filter by location
    if (req.query.city) {
      query['location.city'] = new RegExp(req.query.city, 'i');
    }
    if (req.query.state) {
      query['location.state'] = new RegExp(req.query.state, 'i');
    }

    // Filter by salary range
    if (req.query.minSalary || req.query.maxSalary) {
      query.$and = query.$and || [];
      
      if (req.query.minSalary) {
        query.$and.push({ 'salary.min': { $gte: Number(req.query.minSalary) } });
      }
      
      if (req.query.maxSalary) {
        query.$and.push({ 'salary.max': { $lte: Number(req.query.maxSalary) } });
      }
    }

    // Filter by remote work
    if (req.query.remote === 'true') {
      query['location.remote'] = true;
    }

    // Sorting options
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'salary-high':
          sortOptions = { 'salary.max': -1 };
          break;
        case 'salary-low':
          sortOptions = { 'salary.min': 1 };
          break;
        case 'deadline':
          sortOptions = { applicationDeadline: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Execute query
    const jobs = await Job.find(query)
      .populate('company', 'name logo location industry')
      .populate('postedBy', 'name')
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex);

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Pagination result
    const pagination = {};
    
    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: jobs.length,
      total,
      pagination,
      data: jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting jobs'
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company')
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Increment view count
    job.viewsCount = job.viewsCount + 1;
    await job.save();

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error getting job'
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = async (req, res) => {
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

    // Check if user is employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Only employers can create jobs'
      });
    }

    // Check if user has a company
    if (!req.user.company) {
      return res.status(400).json({
        success: false,
        error: 'Employer must have a company profile to post jobs'
      });
    }

    // Add user and company to req.body
    req.body.postedBy = req.user.id;
    req.body.company = req.user.company;

    const job = await Job.create(req.body);

    // Populate the job with company and user details
    const populatedJob = await Job.findById(job._id)
      .populate('company')
      .populate('postedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: populatedJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating job'
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer only - own jobs)
const updateJob = async (req, res) => {
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

    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Make sure user is the job owner
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this job'
      });
    }

    // Don't allow changing company or postedBy
    delete req.body.company;
    delete req.body.postedBy;

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('company').populate('postedBy', 'name email');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error updating job'
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only - own jobs)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Make sure user is the job owner
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this job'
      });
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete job error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error deleting job'
    });
  }
};

// @desc    Get jobs by employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer only)
const getEmployerJobs = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Only employers can access this route'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Job.countDocuments({ postedBy: req.user.id });

    res.json({
      success: true,
      count: jobs.length,
      total,
      data: jobs
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting employer jobs'
    });
  }
};

// @desc    Get featured jobs
// @route   GET /api/jobs/featured
// @access  Public
const getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ 
      isActive: true, 
      featured: true,
      applicationDeadline: { $gte: new Date() }
    })
      .populate('company', 'name logo location industry')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting featured jobs'
    });
  }
};

// @desc    Toggle job active status
// @route   PUT /api/jobs/:id/toggle-status
// @access  Private (Employer only - own jobs)
const toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Make sure user is the job owner
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this job'
      });
    }

    job.isActive = !job.isActive;
    await job.save();

    res.json({
      success: true,
      message: `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: job._id,
        isActive: job.isActive
      }
    });
  } catch (error) {
    console.error('Toggle job status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating job status'
    });
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getFeaturedJobs,
  toggleJobStatus
};