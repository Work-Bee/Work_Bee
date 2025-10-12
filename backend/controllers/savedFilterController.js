const SavedFilter = require('../models/SavedFilter');

// @desc    Get all saved filters for current user
// @route   GET /api/saved-filters
// @access  Private (jobseeker)
exports.getSavedFilters = async (req, res) => {
  try {
    const filters = await SavedFilter.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: filters
    });
  } catch (error) {
    console.error('Error fetching saved filters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved filters',
      error: error.message
    });
  }
};

// @desc    Get single saved filter
// @route   GET /api/saved-filters/:id
// @access  Private (jobseeker)
exports.getSavedFilter = async (req, res) => {
  try {
    const filter = await SavedFilter.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!filter) {
      return res.status(404).json({
        success: false,
        message: 'Saved filter not found'
      });
    }

    res.status(200).json({
      success: true,
      data: filter
    });
  } catch (error) {
    console.error('Error fetching saved filter:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved filter',
      error: error.message
    });
  }
};

// @desc    Create new saved filter
// @route   POST /api/saved-filters
// @access  Private (jobseeker)
exports.createSavedFilter = async (req, res) => {
  try {
    const { name, filters } = req.body;

    if (!name || !filters) {
      return res.status(400).json({
        success: false,
        message: 'Please provide filter name and filter values'
      });
    }

    // Check user limit (max 10 saved filters)
    await SavedFilter.validateUserLimit(req.user._id);

    // Check for duplicate name for this user
    const existingFilter = await SavedFilter.findOne({
      user: req.user._id,
      name: name
    });

    if (existingFilter) {
      return res.status(400).json({
        success: false,
        message: 'A filter with this name already exists. Please choose a different name.'
      });
    }

    const savedFilter = await SavedFilter.create({
      name,
      filters,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: savedFilter,
      message: 'Filter saved successfully'
    });
  } catch (error) {
    console.error('Error creating saved filter:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating saved filter'
    });
  }
};

// @desc    Update saved filter
// @route   PATCH /api/saved-filters/:id
// @access  Private (jobseeker)
exports.updateSavedFilter = async (req, res) => {
  try {
    const { name, filters } = req.body;

    const filter = await SavedFilter.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!filter) {
      return res.status(404).json({
        success: false,
        message: 'Saved filter not found'
      });
    }

    // Check for duplicate name (excluding current filter)
    if (name && name !== filter.name) {
      const existingFilter = await SavedFilter.findOne({
        user: req.user._id,
        name: name,
        _id: { $ne: req.params.id }
      });

      if (existingFilter) {
        return res.status(400).json({
          success: false,
          message: 'A filter with this name already exists'
        });
      }
    }

    if (name) filter.name = name;
    if (filters) filter.filters = filters;

    await filter.save();

    res.status(200).json({
      success: true,
      data: filter,
      message: 'Filter updated successfully'
    });
  } catch (error) {
    console.error('Error updating saved filter:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating saved filter',
      error: error.message
    });
  }
};

// @desc    Delete saved filter
// @route   DELETE /api/saved-filters/:id
// @access  Private (jobseeker)
exports.deleteSavedFilter = async (req, res) => {
  try {
    const filter = await SavedFilter.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!filter) {
      return res.status(404).json({
        success: false,
        message: 'Saved filter not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Filter deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting saved filter:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting saved filter',
      error: error.message
    });
  }
};
