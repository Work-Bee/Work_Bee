const { body } = require('express-validator');

const PHONE_PATTERN = /^[0-9+()\-\s]{7,15}$/;

const trimString = (value) => (typeof value === 'string' ? value.trim() : value);

const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return ['true', '1', 'yes', 'on'].includes(normalized);
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  return false;
};

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['jobseeker', 'employer'])
    .withMessage('Role must be either jobseeker or employer'),

  body('phone')
    .customSanitizer(trimString)
    .custom((value, { req }) => {
      if (req.body.role === 'employer') {
        if (!value) {
          throw new Error('Primary phone number is required for employers');
        }
      }

      if (value && !PHONE_PATTERN.test(value)) {
        throw new Error('Please provide a valid phone number');
      }

      return true;
    }),

  body('secondaryPhone')
    .customSanitizer(trimString)
    .custom((value, { req }) => {
      if (req.body.role !== 'employer') {
        if (value && !PHONE_PATTERN.test(value)) {
          throw new Error('Please provide a valid secondary phone number');
        }
        return true;
      }

      if (!value) {
        throw new Error('Secondary phone number is required for employers');
      }

      if (!PHONE_PATTERN.test(value)) {
        throw new Error('Please provide a valid secondary phone number');
      }

      if (req.body.phone && value === req.body.phone) {
        throw new Error('Secondary phone must be different from the primary phone');
      }

      return true;
    }),

  body('primaryHasWhatsApp')
    .customSanitizer(parseBoolean)
    .custom((value, { req }) => {
      if (req.body.role !== 'employer') {
        return true;
      }

      const secondary = parseBoolean(req.body.secondaryHasWhatsApp);
      req.body.secondaryHasWhatsApp = secondary;

      if (!value && !secondary) {
        throw new Error('At least one contact number must be reachable on WhatsApp');
      }

      return true;
    }),

  body('secondaryHasWhatsApp')
    .customSanitizer(parseBoolean),

  body('location')
    .customSanitizer(trimString)
    .custom((value, { req }) => {
      if (req.body.role === 'employer') {
        if (!value) {
          throw new Error('Location is required for employers');
        }
      }

      if (value && value.length > 100) {
        throw new Error('Location cannot be more than 100 characters');
      }

      return true;
    })
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role selection is required')
    .isIn(['jobseeker', 'employer', 'admin'])
    .withMessage('Invalid role selection')
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .customSanitizer(trimString)
    .custom((value) => {
      if (value && !PHONE_PATTERN.test(value)) {
        throw new Error('Please provide a valid phone number');
      }

      return true;
    }),

  body('secondaryPhone')
    .optional()
    .customSanitizer(trimString)
    .custom((value, { req }) => {
      if (!value) {
        return true;
      }

      if (!PHONE_PATTERN.test(value)) {
        throw new Error('Please provide a valid secondary phone number');
      }

      if (req.body.phone && value === req.body.phone) {
        throw new Error('Secondary phone must be different from the primary phone');
      }

      return true;
    }),

  body('primaryHasWhatsApp')
    .optional()
    .customSanitizer(parseBoolean),

  body('secondaryHasWhatsApp')
    .optional()
    .customSanitizer(parseBoolean),

  body('location')
    .optional()
    .customSanitizer(trimString)
    .custom((value) => {
      if (value && value.length > 100) {
        throw new Error('Location cannot be more than 100 characters');
      }

      return true;
    }),

  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),

  body('profile.skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('profile.skills.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Each skill cannot be more than 50 characters'),

  body('profile.experience')
    .optional()
    .isIn(['Entry Level', '1-2 years', '3-5 years', '5+ years'])
    .withMessage('Invalid experience level')
];

const validateJob = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 100 })
    .withMessage('Job title cannot be more than 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ max: 2000 })
    .withMessage('Job description cannot be more than 2000 characters'),

  body('category')
    .notEmpty()
    .withMessage('Job category is required')
    .isIn([
      'Manufacturing', 'Construction', 'Retail', 'Food Service',
      'Hospitality', 'Transportation', 'Warehouse', 'Agriculture',
      'Cleaning', 'Security', 'Delivery', 'Customer Service',
      'General Labor', 'Other'
    ])
    .withMessage('Invalid job category'),

  body('jobType')
    .notEmpty()
    .withMessage('Job type is required')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Temporary', 'Seasonal'])
    .withMessage('Invalid job type'),

  body('experienceLevel')
    .notEmpty()
    .withMessage('Experience level is required')
    .isIn(['Entry Level', '1-2 years', '3-5 years', '5+ years'])
    .withMessage('Invalid experience level'),

  body('salary.min')
    .isNumeric()
    .withMessage('Minimum salary must be a number')
    .custom((value, { req }) => {
      if (value < 0) {
        throw new Error('Minimum salary must be positive');
      }
      return true;
    }),

  body('salary.max')
    .isNumeric()
    .withMessage('Maximum salary must be a number')
    .custom((value, { req }) => {
      if (value < req.body.salary.min) {
        throw new Error('Maximum salary must be greater than minimum salary');
      }
      return true;
    }),

  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Job address is required'),

  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('location.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),

  body('applicationDeadline')
    .isISO8601()
    .withMessage('Invalid application deadline format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Application deadline must be in the future');
      }
      return true;
    })
];

const validateApplication = [
  body('coverLetter')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Cover letter cannot be more than 1000 characters')
];

const validateCompany = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot be more than 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Company description is required')
    .isLength({ max: 1000 })
    .withMessage('Company description cannot be more than 1000 characters'),

  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('industry')
    .notEmpty()
    .withMessage('Industry is required')
    .isIn([
      'Manufacturing', 'Construction', 'Retail', 'Food Service',
      'Hospitality', 'Transportation', 'Warehouse', 'Agriculture',
      'Cleaning Services', 'Security', 'Other'
    ])
    .withMessage('Invalid industry'),

  body('size')
    .notEmpty()
    .withMessage('Company size is required')
    .isIn(['1-10', '11-50', '51-200', '201-500', '500+'])
    .withMessage('Invalid company size'),

  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Company address is required'),

  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('location.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),

  body('contactInfo.email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email'),

  body('contactInfo.phone')
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid contact phone number')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateJob,
  validateApplication,
  validateCompany
};