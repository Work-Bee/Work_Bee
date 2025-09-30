require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Job = require('../models/Job');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const jobs = await Job.find({}).select('title location city company category salary');
    console.log(`Found ${jobs.length} jobs`);
    jobs.forEach((job) => {
      console.log(`- ${job.title}: ${job.location.city}, ${job.location.state} (company: ${job.company})`);
    });
  } catch (error) {
    console.error('Error inspecting jobs:', error);
  } finally {
    await mongoose.connection.close();
  }
};

run();
