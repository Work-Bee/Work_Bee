const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume, handleMulterError } = require('../middleware/upload');

// @desc    Upload resume to profile
// @route   POST /api/users/upload-resume
// @access  Private (Job seekers only)
const uploadResumeToProfile = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({
        success: false,
        error: 'Only job seekers can upload resumes'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a resume file'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'profile.resume': {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume: user.profile.resume
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error uploading resume'
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting users'
    });
  }
};

// @desc    Delete resume from profile
// @route   DELETE /api/users/resume
// @access  Private (Job seekers only)
const deleteResume = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({
        success: false,
        error: 'Only job seekers can delete resumes'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user.profile?.resume?.filename) {
      return res.status(404).json({
        success: false,
        error: 'No resume found to delete'
      });
    }

    // Delete the file from the filesystem
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', user.profile.resume.path);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove resume from user profile
    user.profile.resume = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting resume'
    });
  }
};

// Routes
router.use(protect);

router.post('/upload-resume', authorize('jobseeker'), uploadResume.single('resume'), handleMulterError, uploadResumeToProfile);
router.delete('/resume', authorize('jobseeker'), deleteResume);
// router.get('/', authorize('admin'), getUsers); // Uncomment if you need admin functionality

module.exports = router;