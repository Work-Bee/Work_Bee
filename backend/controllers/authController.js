const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Google OAuth client
let googleClient;
const getGoogleClient = () => {
  if (!googleClient) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5555/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth env vars missing: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET');
    }

    googleClient = new OAuth2Client({ clientId, clientSecret, redirectUri });
  }
  return googleClient;
};

// @desc    Start Google OAuth
// @route   GET /api/auth/google
// @access  Public
const googleAuthStart = async (req, res) => {
  try {
    const client = getGoogleClient();
    const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:3333';
    const redirectUri = client.redirectUri;
    const role = req.query.role || 'jobseeker';

    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      include_granted_scopes: true,
      prompt: 'consent',
      redirect_uri: redirectUri,
      state: encodeURIComponent(JSON.stringify({ role, next: req.query.next || '' }))
    });
    res.redirect(url);
  } catch (err) {
    console.error('googleAuthStart error:', err);
    res.status(500).json({ success: false, error: 'Failed to start Google OAuth' });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleAuthCallback = async (req, res) => {
  try {
    const client = getGoogleClient();
    const { code, state } = req.query;
    const parsedState = (() => { try { return JSON.parse(decodeURIComponent(state || '')); } catch { return {}; } })();
    const role = ['jobseeker','employer','admin'].includes(parsedState.role) ? parsedState.role : 'jobseeker';
    const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:3333';

    const { tokens } = await client.getToken({ code, redirect_uri: client.redirectUri });
    const idToken = tokens.id_token;
    if (!idToken) throw new Error('No id_token from Google');

    // Verify ID token
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || email.split('@')[0];

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
        role: role
      });
    }

    // If existing user has different role, keep their role
    const effectiveRole = user.role || role;

    // Issue our JWT
    const appToken = generateToken(user._id);

    // Redirect back to frontend with token
    const nextPath = parsedState.next || '';
    const redirectTo = new URL('/auth/callback', frontendBase);
    redirectTo.searchParams.set('token', appToken);
    redirectTo.searchParams.set('role', effectiveRole);
    res.redirect(redirectTo.toString());
  } catch (err) {
    console.error('googleAuthCallback error:', err);
    res.status(500).json({ success: false, error: 'Google OAuth failed' });
  }
};

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
      'profile',
      // Allow employer-specific details to be updated via profile API
      'companyDetails'
    ];
  const updates = {};

    // Only include allowed fields
    Object.keys(req.body).forEach(key => {
      if (!allowedFields.includes(key)) return;
      if (key === 'companyDetails' && req.body.companyDetails && typeof req.body.companyDetails === 'object') {
        // Use dot-notation for nested updates to avoid overwriting the whole companyDetails object
        Object.keys(req.body.companyDetails).forEach(k => {
          const val = req.body.companyDetails[k];
          if (val !== undefined && val !== null && val !== '') {
            updates[`companyDetails.${k}`] = val;
          }
        });
      } else if (req.body[key] !== undefined) {
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
  googleAuthStart,
  googleAuthCallback
};