const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide company name'],
    unique: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide company description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please provide a valid website URL'
    ]
  },
  logo: {
    type: String // URL or path to logo image
  },
  industry: {
    type: String,
    required: [true, 'Please specify industry'],
    enum: [
      'Manufacturing',
      'Construction',
      'Retail',
      'Food Service',
      'Hospitality',
      'Transportation',
      'Warehouse',
      'Agriculture',
      'Cleaning Services',
      'Security',
      'Other'
    ]
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    required: [true, 'Please specify company size']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide company address']
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
    }
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Please provide contact email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone'],
      maxlength: [15, 'Phone number cannot be more than 15 characters']
    }
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for search functionality
companySchema.index({
  name: 'text',
  description: 'text',
  industry: 'text'
});

module.exports = mongoose.model('Company', companySchema);