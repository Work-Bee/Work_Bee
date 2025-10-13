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

    // Filter by employment type
    if (req.query.employmentType) {
      query.employmentType = req.query.employmentType;
    }

    // Filter by duration
    if (req.query.duration) {
      query.duration = req.query.duration;
    }

    // Backward compatibility: jobType filter
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

    // Exclude expired jobs by default (show only jobs whose deadline hasn't passed)
    if (req.query.includeExpired !== 'true') {
      query.applicationDeadline = { $gte: new Date() };
    }

    // Filter by salary range with unit support (normalize to per-hour)
    if (req.query.minSalary || req.query.maxSalary) {
      query.$and = query.$and || [];
      const unit = (req.query.salaryUnit || 'hour').toLowerCase();

      const HOURS_PER_DAY = 8;
      const DAYS_PER_WEEK = 6;
      const DAYS_PER_MONTH = 26;
      const MONTHS_PER_YEAR = 12;

      const toPerHour = (value) => {
        if (value === undefined) return undefined;
        const v = Number(value);
        if (Number.isNaN(v)) return undefined;
        switch (unit) {
          case 'hour':
            return v;
          case 'day':
            return v / HOURS_PER_DAY;
          case 'week':
            return v / (HOURS_PER_DAY * DAYS_PER_WEEK);
          case 'month':
            return v / (HOURS_PER_DAY * DAYS_PER_MONTH);
          case 'year':
            return v / (HOURS_PER_DAY * DAYS_PER_MONTH * MONTHS_PER_YEAR);
          default:
            return v;
        }
      };

      const minPerHour = toPerHour(req.query.minSalary);
      const maxPerHour = toPerHour(req.query.maxSalary);
      if (minPerHour !== undefined) {
        query.$and.push({ salaryPerHourMin: { $gte: minPerHour } });
      }
      if (maxPerHour !== undefined) {
        query.$and.push({ salaryPerHourMax: { $lte: maxPerHour } });
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
// @access  Public (increments viewsCount uniquely per account when logged in)
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

    // Increment view count uniquely when user is authenticated
    try {
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer') && req.user) {
        const userId = req.user._id || req.user.id;
        const hasViewed = job.uniqueViewers?.some(v => v.toString() === userId.toString());
        if (!hasViewed) {
          job.viewsCount = (job.viewsCount || 0) + 1;
          job.uniqueViewers = job.uniqueViewers || [];
          job.uniqueViewers.push(userId);
          await job.save();
        }
      } else {
        // For unauthenticated viewers, we avoid inflating counts repeatedly.
        // Optionally, we could use a short-lived cookie or IP-based throttle here.
        // For now, do NOT increment to keep counts closer to "unique accounts" as requested.
      }
    } catch (viewErr) {
      console.warn('View count logic warning:', viewErr?.message || viewErr);
    }

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