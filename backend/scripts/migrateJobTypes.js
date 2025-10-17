require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/Job');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for migration');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateJobTypes = async () => {
  try {
    await connectDB();

    // Find all jobs that have jobType but don't have employmentType and duration
    const jobs = await Job.find({
      jobType: { $exists: true },
      $or: [
        { employmentType: { $exists: false } },
        { duration: { $exists: false } }
      ]
    });

    console.log(`Found ${jobs.length} jobs to migrate`);

    let migrated = 0;
    for (const job of jobs) {
      let employmentType = 'Full-time'; // default
      let duration = 'Permanent'; // default

      // Map old jobType to new fields
      switch (job.jobType) {
        case 'Full-time':
          employmentType = 'Full-time';
          duration = 'Permanent';
          break;
        case 'Part-time':
          employmentType = 'Part-time';
          duration = 'Permanent';
          break;
        case 'Contract':
          employmentType = 'Full-time';
          duration = 'Contract';
          break;
        case 'Temporary':
          employmentType = 'Full-time';
          duration = 'Temporary';
          break;
        case 'Seasonal':
          employmentType = 'Full-time';
          duration = 'Seasonal';
          break;
        default:
          console.log(`Unknown jobType "${job.jobType}" for job ${job._id}, using defaults`);
      }

      // Update the job
      job.employmentType = employmentType;
      job.duration = duration;
      await job.save();
      migrated++;

      console.log(`Migrated job ${job._id}: ${job.jobType} → ${employmentType} + ${duration}`);
    }

    console.log(`\nMigration complete! Migrated ${migrated} jobs.`);
    console.log('\nNote: The old jobType field is still present for backward compatibility.');
    console.log('You can remove it in a future migration if needed.');

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateJobTypes();
