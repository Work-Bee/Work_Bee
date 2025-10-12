// One-off migration to compute salaryPerHourMin/Max for existing jobs
require('dotenv').config();
const connectDB = require('../config/db');
const Job = require('../models/Job');

(async () => {
  try {
    await connectDB();
    const HOURS_PER_DAY = 8;
    const DAYS_PER_WEEK = 6;
    const DAYS_PER_MONTH = 26;
    const MONTHS_PER_YEAR = 12;

    const toPerHour = (value, period) => {
      if (!value || value <= 0) return 0;
      switch (period) {
        case 'hour':
          return value;
        case 'day':
          return value / HOURS_PER_DAY;
        case 'week':
          return value / (HOURS_PER_DAY * DAYS_PER_WEEK);
        case 'month':
          return value / (HOURS_PER_DAY * DAYS_PER_MONTH);
        case 'year':
          return value / (HOURS_PER_DAY * DAYS_PER_MONTH * MONTHS_PER_YEAR);
        default:
          return value;
      }
    };

    const cursor = Job.find({}).cursor();
    let processed = 0;
    for (let job = await cursor.next(); job != null; job = await cursor.next()) {
      const period = job.salary?.period || 'hour';
      const min = job.salary?.min;
      const max = job.salary?.max;
      if (min != null && max != null) {
        job.salaryPerHourMin = toPerHour(min, period);
        job.salaryPerHourMax = toPerHour(max, period);
        await job.save();
        processed++;
      }
    }
    console.log(`Normalized salaries for ${processed} jobs.`);
    process.exit(0);
  } catch (e) {
    console.error('Normalization failed:', e);
    process.exit(1);
  }
})();
