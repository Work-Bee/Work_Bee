const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: [true, 'Application must be for a job']
  },
  applicant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Application must have an applicant']
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot be more than 1000 characters']
  },
  resume: {
    filename: {
      type: String,
      required: [true, 'Resume filename is required']
    },
    originalName: {
      type: String,
      required: [true, 'Resume original name is required']
    },
    path: {
      type: String,
      required: [true, 'Resume path is required']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected']
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      maxlength: [500, 'Status note cannot be more than 500 characters']
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  employerNotes: {
    type: String,
    maxlength: [1000, 'Employer notes cannot be more than 1000 characters']
  },
  interviewDetails: {
    scheduledDate: Date,
    location: String,
    type: {
      type: String,
      enum: ['in-person', 'phone', 'video', 'group']
    },
    notes: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  lastStatusUpdate: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one application per job per user
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Index for efficient queries
applicationSchema.index({ applicant: 1, appliedAt: -1 });
applicationSchema.index({ job: 1, status: 1, appliedAt: -1 });
applicationSchema.index({ status: 1 });

// Update lastStatusUpdate when status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastStatusUpdate = Date.now();

    if (this._skipStatusHistory) {
      this._skipStatusHistory = undefined;
    } else {
      // Add to status history
      this.statusHistory.push({
        status: this.status,
        date: Date.now()
      });
    }
  }
  next();
});

// Virtual for application age in days
applicationSchema.virtual('applicationAge').get(function() {
  const today = new Date();
  const applied = new Date(this.appliedAt);
  const timeDiff = today.getTime() - applied.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
});

// Populate job and applicant details by default
applicationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'job',
    select: 'title company location salary jobType applicationDeadline'
  }).populate({
    path: 'applicant',
    select: 'name email phone location profile.skills profile.experience'
  });
  next();
});

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema);