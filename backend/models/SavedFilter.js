const mongoose = require('mongoose');

const savedFilterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Filter name is required'],
      trim: true,
      maxlength: [50, 'Filter name cannot exceed 50 characters']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    filters: {
      search: { type: String, default: '' },
      city: { type: String, default: '' },
      category: { type: String, default: '' },
      employmentType: { type: String, default: '' },
      duration: { type: String, default: '' },
      minSalary: { type: String, default: '' },
      maxSalary: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

// Index for quick user lookup
savedFilterSchema.index({ user: 1, createdAt: -1 });

// Limit number of saved filters per user (optional)
savedFilterSchema.statics.validateUserLimit = async function(userId) {
  const count = await this.countDocuments({ user: userId });
  if (count >= 10) {
    throw new Error('You can only save up to 10 filters. Please delete some before creating new ones.');
  }
};

module.exports = mongoose.model('SavedFilter', savedFilterSchema);
