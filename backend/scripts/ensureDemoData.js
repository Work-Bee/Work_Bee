const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

const DEMO = {
  employer: {
    name: 'Demo Employer',
    email: 'employer@demo.com',
    password: process.env.SEED_DEMO_PASSWORD || 'demo123',
    role: 'employer',
    phone: '+91-99999-00001',
    location: 'Kochi, Kerala',
  },
  jobseeker: {
    name: 'Demo Job Seeker',
    email: 'jobseeker@demo.com',
    password: process.env.SEED_DEMO_PASSWORD || 'demo123',
    role: 'jobseeker',
    phone: '+91-99999-00002',
    location: 'Kochi, Kerala',
    profile: {
      bio: 'Motivated job seeker ready to work in Kochi',
      skills: ['Communication', 'Teamwork'],
      experience: 'Entry Level',
      experienceLevel: 'Entry Level',
    },
  },
  company: {
    name: 'WorkBee Demo Company',
    description: 'Demo employer company used for showcasing the platform in Kochi.',
    website: 'https://example.com',
    industry: 'Retail',
    size: '11-50',
    location: {
      address: 'MG Road',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682016',
    },
    contactInfo: {
      email: 'contact@democo.in',
      phone: '04845550101',
    },
  },
  jobs: [
    {
      title: 'Production Worker',
      description:
        'Join our Kochi line to assist with packing, machine monitoring, and quality checks. Training provided.',
      requirements: [
        'Lift up to 25kg',
        'Stand for 8-hour shifts',
        'Attention to safety',
      ],
      responsibilities: [
        'Operate basic machinery',
        'Follow SOPs',
        'Maintain clean workstation',
      ],
      category: 'Manufacturing',
      jobType: 'Full-time',
      experienceLevel: 'Entry Level',
      salary: { min: 18500, max: 23000, currency: 'INR', period: 'month' },
      location: {
        address: 'Kalamassery Industrial Estate',
        city: 'Kochi',
        state: 'Kerala',
        zipCode: '683104',
        remote: false,
      },
      featured: true,
      tags: ['Training Provided'],
    },
    {
      title: 'Cashier',
      description:
        'Retail store in Panampilly Nagar seeking friendly cashiers to assist customers and handle billing.',
      requirements: ['Basic POS knowledge', 'Customer-friendly'],
      responsibilities: ['Bill customers', 'Reconcile till', 'Maintain counter'],
      category: 'Retail',
      jobType: 'Part-time',
      experienceLevel: 'Entry Level',
      salary: { min: 9000, max: 11000, currency: 'INR', period: 'month' },
      location: {
        address: 'Panampilly Nagar',
        city: 'Kochi',
        state: 'Kerala',
        zipCode: '682036',
        remote: false,
      },
      featured: true,
      tags: ['Flexible Hours'],
    },
    {
      title: 'Delivery Driver',
      description:
        'Support same-day orders across central Kochi. Fuel allowance provided.',
      requirements: ['Valid 2-wheeler license', 'Smartphone with navigation'],
      responsibilities: ['Deliver orders', 'Handle payments', 'Update delivery status'],
      category: 'Delivery',
      jobType: 'Part-time',
      experienceLevel: 'Entry Level',
      salary: { min: 12000, max: 16000, currency: 'INR', period: 'month' },
      location: {
        address: 'Marine Drive',
        city: 'Kochi',
        state: 'Kerala',
        zipCode: '682011',
        remote: false,
      },
      featured: true,
      tags: ['Driving', 'Flexible'],
    },
  ],
  demoResume: {
    filename: 'demo-resume.pdf',
    originalName: 'Demo Resume.pdf',
    // Use existing sample upload path if present; fallback to uploads/resumes/demo-resume.pdf
    path: '/uploads/resumes/68e5f9df36a45efec5d0fb4b_1760256284941-136923813_adonmjohnson.pdf',
  },
};

const ensureUser = async (template) => {
  let user = await User.findOne({ email: template.email }).select('+password');
  if (!user) {
    user = await User.create(template);
    return { user, created: true };
  }
  // If role changed or missing fields, minimally update name/role/phones/location
  const patch = {};
  if (user.name !== template.name) patch.name = template.name;
  if (user.role !== template.role) patch.role = template.role;
  if (template.phone && user.phone !== template.phone) patch.phone = template.phone;
  if (template.location && user.location !== template.location) patch.location = template.location;
  if (Object.keys(patch).length) {
    user.set(patch);
    await user.save();
  }
  return { user, created: false };
};

const ensureCompanyForEmployer = async (employerUser, companyTemplate) => {
  // Prefer company owned by this employer if exists
  let company = await Company.findOne({ owner: employerUser._id });
  if (!company) {
    // Avoid name collision by checking existing company names
    const existingByName = await Company.findOne({ name: companyTemplate.name });
    const name = existingByName ? `${companyTemplate.name} (${employerUser.name})` : companyTemplate.name;
    company = await Company.create({ ...companyTemplate, name, owner: employerUser._id });
  } else {
    // Ensure required fields are present/updated
    const fields = ['description', 'website', 'industry', 'size'];
    fields.forEach((f) => {
      if (companyTemplate[f] && company[f] !== companyTemplate[f]) company[f] = companyTemplate[f];
    });
    // Update nested
    company.location = company.location || {};
    company.location.address = company.location.address || companyTemplate.location.address;
    company.location.city = company.location.city || companyTemplate.location.city;
    company.location.state = company.location.state || companyTemplate.location.state;
    company.location.zipCode = company.location.zipCode || companyTemplate.location.zipCode;
    company.contactInfo = company.contactInfo || {};
    company.contactInfo.email = company.contactInfo.email || companyTemplate.contactInfo.email;
    company.contactInfo.phone = company.contactInfo.phone || companyTemplate.contactInfo.phone;
    await company.save();
  }

  // Ensure employer references this company
  if (!employerUser.company || employerUser.company.toString() !== company._id.toString()) {
    employerUser.company = company._id;
    await employerUser.save();
  }

  return company;
};

const ensureJobs = async (employerUser, company, jobsTemplates) => {
  const results = [];
  for (const jt of jobsTemplates) {
    // Avoid duplicates: title + company + postedBy used as identity
    let job = await Job.findOne({ title: jt.title, company: company._id, postedBy: employerUser._id });
    if (!job) {
      job = await Job.create({
        ...jt,
        company: company._id,
        postedBy: employerUser._id,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      results.push({ title: jt.title, created: true });
    } else {
      results.push({ title: jt.title, created: false });
    }
  }
  return results;
};

const ensureOneApplication = async (jobseekerUser, jobs, demoResume) => {
  if (!jobs.length) return { created: false, reason: 'no-jobs' };

  // Find any application by this jobseeker
  const existing = await Application.findOne({ applicant: jobseekerUser._id });
  if (existing) return { created: false };

  const job = jobs[0];
  await Application.create({
    job: job._id,
    applicant: jobseekerUser._id,
    coverLetter: 'I am very interested in this role and available to start immediately.',
    resume: {
      filename: demoResume.filename,
      originalName: demoResume.originalName,
      path: demoResume.path,
    },
    status: 'pending',
  });
  return { created: true, jobTitle: job.title };
};

const run = async () => {
  try {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) {
      console.error('❌ Missing MONGO_URI. Set it in backend/.env');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected');

    // Ensure users
    const { user: employer, created: employerCreated } = await ensureUser(DEMO.employer);
    const { user: jobseeker, created: jobseekerCreated } = await ensureUser(DEMO.jobseeker);
    console.log(`👤 Employer ${employer.email} ${employerCreated ? 'created' : 'exists'}`);
    console.log(`👤 Jobseeker ${jobseeker.email} ${jobseekerCreated ? 'created' : 'exists'}`);

    // Ensure company
    const company = await ensureCompanyForEmployer(employer, DEMO.company);
    console.log(`🏢 Company '${company.name}' ensured for employer`);

    // Ensure jobs
    const jobResults = await ensureJobs(employer, company, DEMO.jobs);
    const createdJobs = await Job.find({ postedBy: employer._id, company: company._id });
    const createdCount = jobResults.filter((r) => r.created).length;
    console.log(`💼 Jobs ensured (${createdJobs.length} total, ${createdCount} created in this run)`);

    // Ensure one application by jobseeker
    const appResult = await ensureOneApplication(jobseeker, createdJobs, DEMO.demoResume);
    if (appResult.created) {
      console.log(`📝 Created one demo application by ${jobseeker.email} for '${appResult.jobTitle}'`);
    } else {
      console.log('📝 Demo application already exists or no jobs available');
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected. ✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error ensuring demo data:', err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
};

run();
