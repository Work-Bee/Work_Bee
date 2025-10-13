const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      name, 
      email, 
      password, 
      role, 
      phone, 
      secondaryPhone,
      primaryHasWhatsApp,
      secondaryHasWhatsApp,
      location,
      // Job seeker fields
      experienceLevel,
      skills,
      recentJobs,
      preferredLocations,
      degree,
      languages,
      expectedSalary,
      availability,
      workPreference,
      willingToRelocate,
      bio,
      // Employer fields
      companyName,
      industry,
      companySize,
      website,
      companyDetails
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Prepare user data based on role
    const userData = {
      name,
      email,
      password,
      role: role || 'jobseeker',
      phone,
      location,
      secondaryPhone,
      primaryHasWhatsApp,
      secondaryHasWhatsApp
    };

    // Add role-specific data
    if (role === 'jobseeker') {
      userData.profile = {
        experienceLevel,
        skills: Array.isArray(skills) ? skills : [],
        recentJobs: Array.isArray(recentJobs) ? recentJobs : [],
        preferredLocations: Array.isArray(preferredLocations) ? preferredLocations : [],
        degree,
        languages: Array.isArray(languages) ? languages : [],
        expectedSalary,
        availability,
        workPreference,
        willingToRelocate,
        bio
      };
    } else if (role === 'employer') {
      // Support both old format (individual fields) and new format (companyDetails object)
      if (companyDetails) {
        userData.companyDetails = companyDetails;
      } else {
        userData.companyDetails = {
          companyName,
          industry,
          companySize,
          website
        };
      }
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          secondaryPhone: user.secondaryPhone,
          primaryHasWhatsApp: user.primaryHasWhatsApp,
          secondaryHasWhatsApp: user.secondaryHasWhatsApp,
          location: user.location,
          profile: user.profile
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

  const { email, password, role } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (role && user.role !== role) {
      const roleDescriptions = {
        admin: 'admin',
        employer: 'hiring provider',
        jobseeker: 'job seeker'
      };

      const portalNames = {
        admin: 'admin',
        employer: 'employer',
        jobseeker: 'job seeker'
      };

      const registeredAs = roleDescriptions[user.role] || user.role;
      const expectedPortal = portalNames[user.role] || user.role;
      const article = /^[aeiou]/i.test(registeredAs) ? 'an' : 'a';

      return res.status(403).json({
        success: false,
        error: `This account is registered as ${article} ${registeredAs}. Please sign in through the ${expectedPortal} portal.`
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          secondaryPhone: user.secondaryPhone,
          primaryHasWhatsApp: user.primaryHasWhatsApp,
          secondaryHasWhatsApp: user.secondaryHasWhatsApp,
          location: user.location,
          profile: user.profile,
          company: user.company
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('company');
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const allowedFields = [
      'name',
      'phone',
      'secondaryPhone',
      'primaryHasWhatsApp',
      'secondaryHasWhatsApp',
      'location',
      'profile'
    ];
    const updates = {};

    // Only include allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate('company');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error changing password'
    });
  }
};

// @desc    Sign in / Register with Google ID token
// @route   POST /api/auth/google
// @access  Public
const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, error: 'ID token is required' });
    }

    // Lazy require to avoid adding dep to other parts
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    const { sub: googleId, email, email_verified, name, picture } = payload;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Google account has no email' });
    }

    // Find user by googleId or email
    let user = await User.findOne({ googleId });
    if (!user) {
      // If user exists with same email and is local, do NOT auto-link - require explicit linking
      const existingByEmail = await User.findOne({ email });
      if (existingByEmail && existingByEmail.provider === 'local') {
        return res.status(409).json({
          success: false,
          error: 'An account with this email exists. Please sign in and link Google from account settings.'
        });
      }

      // Create new user via Google
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: Math.random().toString(36).slice(-10), // random placeholder (never used)
        provider: 'google',
        googleId,
        isActive: true
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google sign-in successful',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token }
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ success: false, error: 'Server error during Google sign-in' });
  }
};

// @desc    Link Google account to existing logged-in user
// @route   POST /api/auth/google/link
// @access  Private
const googleLink = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, error: 'ID token is required' });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    const { sub: googleId, email } = payload;

    // Ensure the token email matches logged-in user's email
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.email !== email) {
      return res.status(400).json({ success: false, error: 'Google account email does not match user email' });
    }

    // Link account
    user.provider = 'google';
    user.googleId = googleId;
    await user.save();

    res.json({ success: true, message: 'Google account linked successfully' });
  } catch (error) {
    console.error('Google link error:', error);
    res.status(500).json({ success: false, error: 'Server error during Google link' });
  }
};

// @desc    Deactivate account
// @route   PUT /api/auth/deactivate
// @access  Private
const deactivateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deactivating account'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  googleSignIn,
  googleLink
};