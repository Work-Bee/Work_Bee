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
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
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

    // Debug: Log user data
    console.log('User data:', {
      id: req.user.id,
      role: req.user.role,
      hasCompanyDetails: !!req.user.companyDetails,
      companyName: req.user.companyDetails?.companyName,
      industry: req.user.companyDetails?.industry,
      hasCompany: !!req.user.company
    });

    // Check if user has company details filled
    if (!req.user.companyDetails?.companyName || !req.user.companyDetails?.industry) {
      console.log('Missing company details:', {
        companyDetails: req.user.companyDetails
      });
      return res.status(400).json({
        success: false,
        error: 'Please complete your company profile before posting jobs'
      });
    }

    // Create or get company document
    let companyId = req.user.company;
    
    if (!companyId) {
      // Auto-create company from companyDetails if it doesn't exist
      // Map user industry enum to company industry enum
      const industryMap = {
        'IT': 'Other',
        'Finance': 'Other',
        'Healthcare': 'Other',
        'Manufacturing': 'Manufacturing',
        'Retail': 'Retail',
        'Construction': 'Construction',
        'Education': 'Other',
        'Food Service': 'Food Service',
        'Transportation': 'Transportation',
        'Real Estate': 'Other',
        'Other': 'Other'
      };

      const companyData = {
        name: req.user.companyDetails.companyName,
        description: req.user.companyDetails.companyName 
          ? `${req.user.companyDetails.companyName} is hiring! Check out our job openings.`
          : 'We are hiring talented individuals to join our team.',
        industry: industryMap[req.user.companyDetails.industry] || 'Other',
        size: req.user.companyDetails.companySize || '1-10',
        website: req.user.companyDetails.website,
        location: {
          address: req.user.companyDetails.companyAddress || req.user.companyDetails.city || 'Not specified',
          city: req.user.companyDetails.city || 'Not specified',
          state: req.user.companyDetails.state || 'Kerala',
          zipCode: req.user.companyDetails.city ? '682001' : '000000' // Default zipcode if not available
        },
        contactInfo: {
          email: req.user.companyDetails.officialEmail || req.user.email,
          phone: req.user.phone || '0000000000' // Use user phone or default
        },
        owner: req.user.id
      };

      const company = await Company.create(companyData);
      companyId = company._id;

      // Update user with company reference
      req.user.company = companyId;
      await req.user.save();
    }

    // Add user and company to req.body
    req.body.postedBy = req.user.id;
    req.body.company = companyId;

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
    // Surface validation errors clearly
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((e) => e.message);
      console.error('Create job validation error:', details);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details
      });
    }

    console.error('Create job error:', error.message || error, error.stack ? `\n${error.stack}` : '');
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

// @desc    Get recommended jobs based on user profile
// @route   GET /api/jobs/recommended
// @access  Private (Job seekers only)
const getRecommendedJobs = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({
        success: false,
        error: 'Only job seekers can access recommended jobs'
      });
    }

    const profile = req.user.profile || {};
    const limit = parseInt(req.query.limit, 10) || 6;

    // Check if profile is complete enough for recommendations
    const hasPreferences = profile.preferredLocations?.length > 0 || 
                          profile.skills?.length > 0 ||
                          profile.experience ||
                          profile.recentJobs?.length > 0;

    if (!hasPreferences) {
      return res.json({
        success: true,
        needsProfile: true,
        message: 'Please complete your profile to get personalized job recommendations',
        data: []
      });
    }

    // Build recommendation query
    let query = { isActive: true };
    let scoredJobs = [];

    // Get all active jobs
    const allJobs = await Job.find(query)
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .limit(50) // Get top 50 recent jobs for scoring
      .lean();

    // Score each job based on user profile
    for (const job of allJobs) {
      let score = 0;

      // Location matching (highest priority)
      if (profile.preferredLocations?.length > 0) {
        const jobLocation = `${job.location.city}, ${job.location.state}`.toLowerCase();
        const hasLocationMatch = profile.preferredLocations.some(loc => 
          jobLocation.includes(loc.toLowerCase()) || loc.toLowerCase().includes(job.location.city.toLowerCase())
        );
        if (hasLocationMatch) score += 50;
      }

      // Experience level matching
      if (profile.experience || profile.experienceLevel) {
        const userExp = profile.experience || profile.experienceLevel;
        if (job.experienceLevel === userExp) score += 30;
        // Also match Entry Level jobs for users with "Some Experience"
        if (userExp === 'Some Experience' && job.experienceLevel === 'Entry Level') score += 20;
      }

      // Skills matching
      if (profile.skills?.length > 0 && job.title) {
        const jobTitleLower = job.title.toLowerCase();
        const matchingSkills = profile.skills.filter(skill => 
          jobTitleLower.includes(skill.toLowerCase())
        );
        score += matchingSkills.length * 15;
      }

      // Recent jobs matching (job title similarity)
      if (profile.recentJobs?.length > 0 && job.title) {
        const jobTitleLower = job.title.toLowerCase();
        const hasRelatedJob = profile.recentJobs.some(recentJob => 
          jobTitleLower.includes(recentJob.toLowerCase()) || 
          recentJob.toLowerCase().includes(jobTitleLower.split(' ')[0])
        );
        if (hasRelatedJob) score += 25;
      }

      // Prefer jobs with higher salaries (small boost)
      if (job.salary?.min) {
        score += Math.min(job.salary.min / 5000, 10); // Max 10 points for salary
      }

      // Prefer jobs with longer deadlines (more time to apply)
      const daysUntilDeadline = Math.ceil(
        (new Date(job.applicationDeadline) - new Date()) / (1000 * 3600 * 24)
      );
      if (daysUntilDeadline > 7) score += 5;

      // Only include jobs with a minimum score
      if (score > 0) {
        scoredJobs.push({ ...job, recommendationScore: score });
      }
    }

    // Sort by score and return top jobs
    scoredJobs.sort((a, b) => b.recommendationScore - a.recommendationScore);
    const recommendedJobs = scoredJobs.slice(0, limit);

    res.json({
      success: true,
      needsProfile: false,
      count: recommendedJobs.length,
      data: recommendedJobs
    });

  } catch (error) {
    console.error('Get recommended jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting recommended jobs'
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
  toggleJobStatus,
  getRecommendedJobs
};