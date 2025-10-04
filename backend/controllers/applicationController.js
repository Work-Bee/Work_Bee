const { validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const path = require('path');
const fs = require('fs');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Job seekers only)
const applyForJob = async (req, res) => {
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

    const { jobId, coverLetter } = req.body;

    // Check if user is a job seeker
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({
        success: false,
        error: 'Only job seekers can apply for jobs'
      });
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        error: 'This job is no longer active'
      });
    }

    // Check if application deadline has passed
    if (new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        error: 'Application deadline has passed'
      });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this job'
      });
    }

    // Determine resume source: uploaded file or profile resume
    let resumeData;
    
    if (req.file) {
      // Use newly uploaded resume
      resumeData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      };
    } else if (req.user.profile && req.user.profile.resume) {
      // Use profile resume
      resumeData = {
        filename: req.user.profile.resume.filename,
        originalName: req.user.profile.resume.originalName,
        path: req.user.profile.resume.path
      };
    } else {
      // No resume available
      return res.status(400).json({
        success: false,
        error: 'You cannot apply without uploading a resume. Please upload your resume in your profile first.'
      });
    }

    // Create application
    const applicationData = {
      job: jobId,
      applicant: req.user.id,
      coverLetter,
      resume: resumeData
    };

    const application = await Application.create(applicationData);

    // Increment job applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });

    // Populate application with job and applicant details
    const populatedApplication = await Application.findById(application._id)
      .populate({
        path: 'job',
        select: 'title company location salary jobType',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .populate('applicant', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populatedApplication
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    
    // Delete uploaded file if application creation failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error submitting application'
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/applications/my-applications
// @access  Private (Job seekers only)
const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({
        success: false,
        error: 'Only job seekers can access their applications'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filter by status if provided
    let query = { applicant: req.user.id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        select: 'title company location salary jobType applicationDeadline',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort({ appliedAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      count: applications.length,
      total,
      data: applications
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting applications'
    });
  }
};

// @desc    Get applications for employer's jobs
// @route   GET /api/applications/employer/:jobId
// @access  Private (Employers only)
const getJobApplications = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Only employers can access job applications'
      });
    }

    const { jobId } = req.params;

    // Verify the job belongs to the employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access applications for this job'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filter by status if provided
    let query = { job: jobId };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('applicant', 'name email phone location profile')
      .sort({ appliedAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Application.countDocuments(query);

    // Get application statistics
    const stats = await Application.aggregate([
      { $match: { job: job._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {};
    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      count: applications.length,
      total,
      stats: statusCounts,
      data: applications
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting job applications'
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private (Application owner or job poster)
const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        populate: {
          path: 'company postedBy',
          select: 'name email'
        }
      })
      .populate('applicant', 'name email phone location profile');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check authorization
    const isApplicant = application.applicant._id.toString() === req.user.id;

    let jobPosterId;
    if (application.job?.postedBy) {
      jobPosterId = application.job.postedBy._id
        ? application.job.postedBy._id.toString()
        : application.job.postedBy.toString();
    } else {
      const jobId = application.job?._id || application.job;
      const jobDoc = jobId ? await Job.findById(jobId).select('postedBy') : null;
      jobPosterId = jobDoc?.postedBy ? jobDoc.postedBy.toString() : null;
    }

    const isJobPoster = jobPosterId === req.user.id;

    if (!isApplicant && !isJobPoster && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this application'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error getting application'
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employers only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Only employers can update application status'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate({ path: 'job', select: 'postedBy' });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if employer owns the job
    let jobOwnerId;

    if (application.job && application.job.postedBy) {
      jobOwnerId = application.job.postedBy.toString();
    } else {
      const jobId = application.job?._id || application.job;
      const jobDoc = jobId ? await Job.findById(jobId).select('postedBy') : null;

      if (!jobDoc) {
        return res.status(404).json({
          success: false,
          error: 'Associated job not found'
        });
      }

      jobOwnerId = jobDoc.postedBy.toString();
    }

    if (jobOwnerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this application'
      });
    }

    // Update status and add to history
    application.status = status;
    application.statusHistory.push({
      status,
      note,
      updatedBy: req.user.id,
      date: new Date()
    });
    application._skipStatusHistory = true;
    application.lastStatusUpdate = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        id: application._id,
        status: application.status,
        lastStatusUpdate: application.lastStatusUpdate
      }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating application status'
    });
  }
};

// @desc    Add employer notes to application
// @route   PUT /api/applications/:id/notes
// @access  Private (Employers only)
const addEmployerNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Only employers can add notes to applications'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate({ path: 'job', select: 'postedBy' });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if employer owns the job
    let jobOwnerId;

    if (application.job && application.job.postedBy) {
      jobOwnerId = application.job.postedBy.toString();
    } else {
      const jobId = application.job?._id || application.job;
      const jobDoc = jobId ? await Job.findById(jobId).select('postedBy') : null;

      if (!jobDoc) {
        return res.status(404).json({
          success: false,
          error: 'Associated job not found'
        });
      }

      jobOwnerId = jobDoc.postedBy.toString();
    }

    if (jobOwnerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this application'
      });
    }

    application.employerNotes = notes;
    await application.save();

    res.json({
      success: true,
      message: 'Notes added successfully',
      data: {
        id: application._id,
        employerNotes: application.employerNotes
      }
    });
  } catch (error) {
    console.error('Add employer notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding notes'
    });
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private (Job seekers only - own applications)
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to withdraw this application'
      });
    }

    // Check if application can be withdrawn
    if (['hired', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot withdraw application with current status'
      });
    }

    // Delete resume file
    if (application.resume && application.resume.path) {
      fs.unlink(application.resume.path, (err) => {
        if (err) console.error('Error deleting resume file:', err);
      });
    }

    await application.deleteOne();

    // Decrement job applications count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationsCount: -1 }
    });

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: {}
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error withdrawing application'
    });
  }
};

// @desc    Get all applications for employer dashboard
// @route   GET /api/applications/employer/all
// @access  Private (Employers only)
const getAllEmployerApplications = async (req, res) => {
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

    // Get all jobs posted by this employer
    const employerJobs = await Job.find({ postedBy: req.user.id }).select('_id');
    const jobIds = employerJobs.map(job => job._id);

    let query = { job: { $in: jobIds } };

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        select: 'title company',
        populate: {
          path: 'company',
          select: 'name'
        }
      })
      .populate('applicant', 'name email phone')
      .sort({ appliedAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      count: applications.length,
      total,
      data: applications
    });
  } catch (error) {
    console.error('Get all employer applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting applications'
    });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus,
  addEmployerNotes,
  withdrawApplication,
  getAllEmployerApplications
};