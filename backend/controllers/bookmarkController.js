const Bookmark = require('../models/Bookmark');
const Job = require('../models/Job');

// @desc    Add bookmark
// @route   POST /api/bookmarks
// @access  Private (Job seekers only)
const addBookmark = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Job ID is required'
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      job: jobId
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        error: 'Job already bookmarked'
      });
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      user: req.user.id,
      job: jobId
    });

    res.status(201).json({
      success: true,
      message: 'Job bookmarked successfully',
      data: bookmark
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding bookmark'
    });
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:jobId
// @access  Private (Job seekers only)
const removeBookmark = async (req, res) => {
  try {
    const { jobId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user.id,
      job: jobId
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found'
      });
    }

    res.json({
      success: true,
      message: 'Bookmark removed successfully',
      data: {}
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error removing bookmark'
    });
  }
};

// @desc    Get user's bookmarks
// @route   GET /api/bookmarks
// @access  Private (Job seekers only)
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching bookmarks'
    });
  }
};

// @desc    Check if job is bookmarked
// @route   GET /api/bookmarks/check/:jobId
// @access  Private (Job seekers only)
const checkBookmark = async (req, res) => {
  try {
    const { jobId } = req.params;

    const bookmark = await Bookmark.findOne({
      user: req.user.id,
      job: jobId
    });

    res.json({
      success: true,
      data: {
        isBookmarked: !!bookmark
      }
    });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error checking bookmark'
    });
  }
};

module.exports = {
  addBookmark,
  removeBookmark,
  getBookmarks,
  checkBookmark
};
