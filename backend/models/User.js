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
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    skills: [{
      type: String,
      maxlength: [50, 'Skill cannot be more than 50 characters']
    }],
    experience: {
      type: String,
      enum: ['Entry Level', 'Some Experience', 'Experienced', 'Very Experienced'],
      default: 'Entry Level'
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Some Experience', 'Experienced', 'Very Experienced']
    },
    resume: {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
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
    industry: {
      type: String,
      enum: ['Construction', 'Manufacturing', 'Retail', 'Food Service', 'Warehouse', 'Transportation', 'Cleaning', 'Agriculture', 'Healthcare', 'Other']
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    },
    website: {
      type: String,
      maxlength: [200, 'Website URL cannot be more than 200 characters']
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