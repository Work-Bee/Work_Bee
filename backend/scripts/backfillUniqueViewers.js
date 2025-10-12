// One-off script to backfill uniqueViewers from applications as a conservative baseline
// Usage: node scripts/backfillUniqueViewers.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Job = require('../models/Job');
const Application = require('../models/Application');

(async () => {
  try {
    await connectDB();
    const jobs = await Job.find({}).select('_id viewsCount applicationsCount uniqueViewers');
    let updated = 0;
    for (const job of jobs) {
      const apps = await Application.find({ job: job._id }).select('applicant').lean();
      const viewerIds = Array.from(new Set(apps.map(a => a.applicant?.toString()).filter(Boolean)));
      const needsUpdate = (job.uniqueViewers?.length || 0) === 0 && viewerIds.length > 0;
      if (needsUpdate) {
        job.uniqueViewers = viewerIds;
        // Keep viewsCount >= unique viewers, but don't reduce if currently higher
        job.viewsCount = Math.max(job.viewsCount || 0, viewerIds.length);
        await job.save();
        updated++;
      }
    }
    console.log(`Backfill complete. Updated ${updated} jobs.`);
    process.exit(0);
  } catch (e) {
    console.error('Backfill error:', e);
    process.exit(1);
  }
})();
