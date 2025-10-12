const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide job title'],
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide job description'],
    maxlength: [2000, 'Job description cannot be more than 2000 characters']
  },
  requirements: [{
    type: String,
    maxlength: [200, 'Requirement cannot be more than 200 characters']
  }],
  responsibilities: [{
    type: String,
    maxlength: [200, 'Responsibility cannot be more than 200 characters']
  }],
  category: {
    type: String,
    required: [true, 'Please specify job category'],
    enum: [
      'Manufacturing',
      'Construction',
      'Retail',
      'Food Service',
      'Hospitality',
      'Transportation',
      'Warehouse',
      'Agriculture',
      'Cleaning',
      'Security',
      'Delivery',
      'Customer Service',
      'General Labor',
      'Other'
    ]
  },
  employmentType: {
    type: String,
    required: [true, 'Please specify employment type'],
    enum: ['Full-time', 'Part-time']
  },
  duration: {
    type: String,
    required: [true, 'Please specify duration'],
    enum: ['Permanent', 'Contract', 'Temporary', 'Seasonal']
  },
  // Keep jobType for backward compatibility during migration
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Seasonal']
  },
  experienceLevel: {
    type: String,
    required: [true, 'Please specify experience level'],
    enum: ['Entry Level', '1-2 years', '3-5 years', '5+ years']
  },
  salary: {
    min: {
      type: Number,
      required: [true, 'Please provide minimum salary']
    },
    max: {
      type: Number,
      required: [true, 'Please provide maximum salary']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR']
    },
    period: {
      type: String,
      enum: ['hour', 'day', 'week', 'month', 'year'],
      default: 'hour'
    }
  },
  // Normalized salary per hour for consistent filtering
  salaryPerHourMin: { type: Number, default: 0 },
  salaryPerHourMax: { type: Number, default: 0 },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide job location']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide zip code']
    },
    remote: {
      type: Boolean,
      default: false
    }
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'Job must belong to a company']
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Job must have a poster']
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Please provide application deadline']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  // Track which users have viewed this job (for unique view counting)
  uniqueViewers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for search and filtering
jobSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

jobSchema.index({ category: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ 'location.city': 1 });
jobSchema.index({ 'location.state': 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ salaryPerHourMin: 1, salaryPerHourMax: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ applicationDeadline: 1 });

// Update the updatedAt field before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Normalize salary to per-hour values for consistent filtering
  try {
    const HOURS_PER_DAY = 8;
    const DAYS_PER_WEEK = 6;
    const DAYS_PER_MONTH = 26;
    const MONTHS_PER_YEAR = 12;

    const toPerHour = (value, period) => {
      if (!value || value <= 0) return 0;
      switch (period) {
        case 'hour':
          return value;
        case 'day':
          return value / HOURS_PER_DAY;
        case 'week':
          return value / (HOURS_PER_DAY * DAYS_PER_WEEK);
        case 'month':
          return value / (HOURS_PER_DAY * DAYS_PER_MONTH);
        case 'year':
          return value / (HOURS_PER_DAY * DAYS_PER_MONTH * MONTHS_PER_YEAR);
        default:
          return value;
      }
    };

    if (this.salary && this.salary.min != null && this.salary.max != null) {
      const period = this.salary.period || 'hour';
      this.salaryPerHourMin = toPerHour(this.salary.min, period);
      this.salaryPerHourMax = toPerHour(this.salary.max, period);
    }
  } catch (e) {
    // If normalization fails, keep previous values
  }
  next();
});

// Ensure normalization also happens on findOneAndUpdate
jobSchema.pre('findOneAndUpdate', function(next) {
  try {
    const update = this.getUpdate() || {};
    const $set = update.$set || update;

    const HOURS_PER_DAY = 8;
    const DAYS_PER_WEEK = 6;
    const DAYS_PER_MONTH = 26;
    const MONTHS_PER_YEAR = 12;

    const toPerHour = (value, period) => {
      if (!value || value <= 0) return 0;
      switch (period) {
        case 'hour':
          return value;
        case 'day':
          return value / HOURS_PER_DAY;
        case 'week':
          return value / (HOURS_PER_DAY * DAYS_PER_WEEK);
        case 'month':
          return value / (HOURS_PER_DAY * DAYS_PER_MONTH);
        case 'year':
          return value / (HOURS_PER_DAY * DAYS_PER_MONTH * MONTHS_PER_YEAR);
        default:
          return value;
      }
    };

    // If salary is being updated, recompute normalized fields
    if ($set.salary && ($set.salary.min != null || $set.salary.max != null || $set.salary.period)) {
      const period = $set.salary.period || this.get('salary.period') || 'hour';
      const min = $set.salary.min != null ? $set.salary.min : this.get('salary.min');
      const max = $set.salary.max != null ? $set.salary.max : this.get('salary.max');
      const salaryPerHourMin = toPerHour(min, period);
      const salaryPerHourMax = toPerHour(max, period);
      this.setUpdate({
        ...update,
        $set: {
          ...$set,
          salaryPerHourMin,
          salaryPerHourMax,
          updatedAt: Date.now(),
        }
      });
    } else {
      // still update updatedAt
      this.setUpdate({
        ...update,
        $set: {
          ...$set,
          updatedAt: Date.now(),
        }
      });
    }
  } catch (e) {
    // swallow and continue
  }
  next();
});

// Virtual for days until deadline
jobSchema.virtual('daysUntilDeadline').get(function() {
  const today = new Date();
  const deadline = new Date(this.applicationDeadline);
  const timeDiff = deadline.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual populate for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
  justOne: false
});

// Ensure virtual fields are serialized
jobSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);