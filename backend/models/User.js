const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['jobseeker', 'employer', 'admin'],
    default: 'jobseeker'
  },
  phone: {
    type: String,
    maxlength: [15, 'Phone number cannot be more than 15 characters']
  },
  secondaryPhone: {
    type: String,
    maxlength: [15, 'Secondary phone number cannot be more than 15 characters']
  },
  primaryHasWhatsApp: {
    type: Boolean,
    default: false
  },
  secondaryHasWhatsApp: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  // For job seekers
  profile: {
    // Basic professional info
    recentJobs: [{
      type: String,
      maxlength: [100, 'Job title cannot be more than 100 characters']
    }],
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    skills: [{
      type: String,
      maxlength: [50, 'Skill cannot be more than 50 characters']
    }],
    
    // Experience
    experience: {
      type: String,
      enum: ['Entry Level', 'Some Experience', 'Experienced', 'Very Experienced'],
      default: 'Entry Level'
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Some Experience', 'Experienced', 'Very Experienced']
    },
    yearsOfExperience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
      max: [50, 'Years of experience cannot exceed 50']
    },
    
    // Location preferences
    preferredLocations: [{
      type: String,
      maxlength: [100, 'Location cannot be more than 100 characters']
    }],
    
    // Education - Simplified to just highest qualification
    degree: {
      type: String,
      maxlength: [100, 'Degree cannot be more than 100 characters']
    },
    
    // Resume and photos
    resume: {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    profilePhoto: {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    
    // Links
    linkedinUrl: {
      type: String,
      maxlength: [300, 'LinkedIn URL cannot be more than 300 characters']
    },
    githubUrl: {
      type: String,
      maxlength: [300, 'GitHub URL cannot be more than 300 characters']
    },
    portfolioUrl: {
      type: String,
      maxlength: [300, 'Portfolio URL cannot be more than 300 characters']
    },
    
    // Languages
    languages: [{
      type: String,
      maxlength: [50, 'Language name cannot be more than 50 characters']
    }],
    
    // Salary and availability
    expectedSalary: {
      min: {
        type: Number,
        min: [0, 'Minimum salary cannot be negative']
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary cannot be negative']
      },
      currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
      },
      period: {
        type: String,
        default: 'year',
        enum: ['hour', 'month', 'year']
      }
    },
    availability: {
      type: String,
      enum: ['Immediate', 'Within 30 days', 'Within 60 days', 'Contract', 'Negotiable'],
      default: 'Immediate'
    },
    
    // Work preferences
    workPreference: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site', 'Flexible'],
      default: 'Flexible'
    },
    willingToRelocate: {
      type: String,
      enum: ['Yes', 'No', 'Maybe'],
      default: 'Maybe'
    }
  },
  // For employers
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company'
  },
  // Employer specific fields (for registration)
  companyDetails: {
    companyName: {
      type: String,
      maxlength: [100, 'Company name cannot be more than 100 characters']
    },
    officialEmail: {
      type: String,
      maxlength: [100, 'Official email cannot be more than 100 characters']
    },
    website: {
      type: String,
      maxlength: [200, 'Website URL cannot be more than 200 characters']
    },
    linkedInPage: {
      type: String,
      maxlength: [200, 'LinkedIn URL cannot be more than 200 characters']
    },
    contactPersonRole: {
      type: String,
      maxlength: [50, 'Contact person role cannot be more than 50 characters']
    },
    industry: {
      type: String,
      enum: ['IT', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Construction', 'Education', 'Food Service', 'Transportation', 'Real Estate', 'Other']
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '200+']
    },
    companyAddress: {
      type: String,
      maxlength: [200, 'Company address cannot be more than 200 characters']
    },
    city: {
      type: String,
      maxlength: [50, 'City cannot be more than 50 characters']
    },
    state: {
      type: String,
      maxlength: [50, 'State cannot be more than 50 characters']
    },
    companyLogo: {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    glassdoorUrl: {
      type: String,
      maxlength: [200, 'Glassdoor URL cannot be more than 200 characters']
    },
    otherSocialLink: {
      type: String,
      maxlength: [200, 'Social link cannot be more than 200 characters']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);