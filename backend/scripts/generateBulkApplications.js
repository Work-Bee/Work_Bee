/*
Generate many applications for a single job to test UI at scale.

Usage examples:
  node scripts/generateBulkApplications.js --count=50               # uses demo employer's first job
  node scripts/generateBulkApplications.js --count=200 --job=JOBID  # target a specific job id
  node scripts/generateBulkApplications.js --count=100 --employer=employer@demo.com

Notes:
- Creates lightweight jobseeker users if needed (name/email unique), attaches a demo resume.
- Ensures one application per user per job (respects unique index).
- Randomizes status and appliedAt timestamps across recent days for realism.
*/

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

const DEMO_RESUME = {
  filename: 'bulk-demo-resume.pdf',
  originalName: 'Bulk Demo Resume.pdf',
  path: '/uploads/resumes/68e5f9df36a45efec5d0fb4b_1760256284941-136923813_adonmjohnson.pdf',
};

const STATUS_VALUES = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected'];

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (const a of args) {
    const [k, v] = a.split('=');
    const key = k.replace(/^--/, '');
    out[key] = v === undefined ? true : v;
  }
  return out;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function getTargetJob({ employer, job }) {
  if (job && job !== 'first') {
    const byId = await Job.findById(job);
    if (!byId) throw new Error(`Job not found: ${job}`);
    return byId;
  }

  const employerDoc = employer
    ? await User.findOne({ email: employer })
    : await User.findOne({ email: 'employer@demo.com' });
  if (!employerDoc) throw new Error('Demo employer not found');

  const firstJob = await Job.findOne({ postedBy: employerDoc._id }).sort({ createdAt: 1 });
  if (!firstJob) throw new Error('No jobs found for employer');
  return firstJob;
}

async function ensureJobSeeker(i) {
  const email = `bulk_user_${i}@example.com`;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: `Bulk User ${i}`,
      email,
      password: process.env.SEED_DEMO_PASSWORD || 'demo123',
      role: 'jobseeker',
      phone: `+91-90000-${String(10000 + i).slice(-5)}`,
      location: 'Kochi, Kerala',
      profile: {
        bio: 'Bulk generated candidate',
        skills: ['Communication', 'Teamwork'],
        experience: 'Entry Level',
        experienceLevel: 'Entry Level',
        resume: { ...DEMO_RESUME },
      },
    });
  }
  return user;
}

async function createApplication(user, job, i) {
  try {
    const exists = await Application.findOne({ job: job._id, applicant: user._id });
    if (exists) return { created: false };

    const status = randChoice(STATUS_VALUES);
    const appliedAt = daysAgo(Math.floor(Math.random() * 25));

    await Application.create({
      job: job._id,
      applicant: user._id,
      coverLetter: `Cover letter from ${user.name}`,
      resume: { ...DEMO_RESUME },
      status,
      appliedAt,
      lastStatusUpdate: appliedAt,
    });
    // Keep Job.applicationsCount roughly accurate
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    return { created: true, status };
  } catch (err) {
    if (err && err.code === 11000) {
      return { created: false, reason: 'dup' };
    }
    throw err;
  }
}

async function run() {
  const args = parseArgs();
  const count = parseInt(args.count || '50', 10);
  const employer = args.employer;
  const jobArg = args.job || 'first';

  const { MONGO_URI } = process.env;
  if (!MONGO_URI) {
    console.error('❌ Missing MONGO_URI. Set it in backend/.env');
    process.exit(1);
  }

  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('✅ Connected');

  const job = await getTargetJob({ employer, job: jobArg });
  console.log(`🎯 Target job: ${job.title} (${job._id})`);

  let created = 0;
  const statusCounts = {};

  for (let i = 1; i <= count; i++) {
    const user = await ensureJobSeeker(i);
    const res = await createApplication(user, job, i);
    if (res.created) {
      created += 1;
      statusCounts[res.status] = (statusCounts[res.status] || 0) + 1;
    }
    if (i % 20 === 0) console.log(`... processed ${i} users (created so far: ${created})`);
  }

  console.log(`✅ Done. Applications created: ${created} / ${count}`);
  console.log('📊 Status distribution:', statusCounts);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('❌ Bulk generation failed:', err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
