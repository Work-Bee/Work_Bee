const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const getDashboard = async (req, res) => {
  try {
    const [
      totalJobSeekers,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      recentJobSeekers,
      recentEmployers,
      recentJobs,
      recentApplications
    ] = await Promise.all([
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments({}),
      Job.countDocuments({ isActive: true }),
      Application.countDocuments({}),
      User.find({ role: 'jobseeker' })
        .select('name email phone location profile.experience createdAt isActive')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      User.find({ role: 'employer' })
        .select('name email phone location company companyDetails createdAt isActive')
        .populate('company', 'name industry size')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Job.find({})
        .select('title jobType experienceLevel isActive applicationDeadline applicationsCount createdAt postedBy company')
        .populate('postedBy', 'name email role')
        .populate('company', 'name industry')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Application.find({})
        .select('status appliedAt lastStatusUpdate job applicant')
        .populate('job', 'title company applicationDeadline')
        .populate({ path: 'job', populate: { path: 'company', select: 'name industry' } })
        .populate('applicant', 'name email role')
        .sort({ appliedAt: -1 })
        .limit(10)
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          totalJobSeekers,
          totalEmployers,
          totalJobs,
          activeJobs,
          totalApplications
        },
        recentJobSeekers,
        recentEmployers,
        recentJobs,
        recentApplications
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load admin overview'
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email role phone location company companyDetails profile createdAt isActive')
        .populate('company', 'name industry size')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin getUsers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    if (req.query.status === 'active') {
      query.isActive = true;
    } else if (req.query.status === 'inactive') {
      query.isActive = false;
    }

    if (req.query.company) {
      query.company = req.query.company;
    }

    if (req.query.poster) {
      query.postedBy = req.query.poster;
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .select('title jobType experienceLevel location isActive applicationDeadline applicationsCount createdAt postedBy company salary')
        .populate('postedBy', 'name email role')
        .populate('company', 'name industry size')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin getJobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
};

const getApplications = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.applicant) {
      query.applicant = req.query.applicant;
    }

    if (req.query.job) {
      query.job = req.query.job;
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .select('status appliedAt lastStatusUpdate job applicant')
        .populate('job', 'title company')
        .populate({ path: 'job', populate: { path: 'company', select: 'name' } })
        .populate('applicant', 'name email role')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin getApplications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getJobs,
  getApplications
};
