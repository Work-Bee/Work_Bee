const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI environment variable. Please set it before running this script.');
  process.exit(1);
}

const employersSeed = [
  {
    user: {
      name: 'Atlas Manufacturing',
      email: 'hiring@atlasmanufacturing.com',
      password: 'AtlasHire#2025',
      role: 'employer',
      phone: '+1-415-555-0191',
      primaryHasWhatsApp: true,
      location: 'San Francisco, CA',
      companyDetails: {
        companyName: 'Atlas Manufacturing',
        industry: 'Manufacturing',
        companySize: '201-500',
        website: 'https://www.atlasmanufacturing.com'
      }
    },
    company: {
      name: 'Atlas Manufacturing',
      description: 'Precision metal fabrication and industrial equipment manufacturing.',
      website: 'https://www.atlasmanufacturing.com',
      industry: 'Manufacturing',
      size: '201-500',
      location: {
        address: '455 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105'
      },
      contactInfo: {
        email: 'contact@atlasmanufacturing.com',
        phone: '+1-415-555-0107'
      }
    }
  },
  {
    user: {
      name: 'Brightline Logistics',
      email: 'talent@brightlinelogistics.com',
      password: 'Brightline!2025',
      role: 'employer',
      phone: '+1-206-555-0144',
      primaryHasWhatsApp: true,
      location: 'Seattle, WA',
      companyDetails: {
        companyName: 'Brightline Logistics',
        industry: 'Transportation',
        companySize: '51-200',
        website: 'https://www.brightlinelogistics.com'
      }
    },
    company: {
      name: 'Brightline Logistics',
      description: 'Regional logistics provider specializing in last-mile delivery services.',
      website: 'https://www.brightlinelogistics.com',
      industry: 'Transportation',
      size: '51-200',
      location: {
        address: '908 Western Ave',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98104'
      },
      contactInfo: {
        email: 'hr@brightlinelogistics.com',
        phone: '+1-206-555-0155'
      }
    }
  },
  {
    user: {
      name: 'Summit Hospitality Group',
      email: 'careers@summithospitalitygroup.com',
      password: 'SummitStay#88',
      role: 'employer',
      phone: '+1-312-555-0186',
      primaryHasWhatsApp: false,
      location: 'Chicago, IL',
      companyDetails: {
        companyName: 'Summit Hospitality Group',
        industry: 'Food Service',
        companySize: '11-50',
        website: 'https://www.summithospitalitygroup.com'
      }
    },
    company: {
      name: 'Summit Hospitality Group',
      description: 'Boutique hotel and resort management company focused on elevated guest experiences.',
      website: 'https://www.summithospitalitygroup.com',
      industry: 'Hospitality',
      size: '11-50',
      location: {
        address: '1225 Lakeshore Dr',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60611'
      },
      contactInfo: {
        email: 'hello@summithospitalitygroup.com',
        phone: '+1-312-555-0210'
      }
    }
  }
];

const jobSeekersSeed = [
  {
    name: 'Priya Desai',
    email: 'priya.desai@example.com',
    password: 'PriyaWork#25',
    role: 'jobseeker',
    phone: '+1-510-555-0331',
    primaryHasWhatsApp: true,
    location: 'Oakland, CA',
    profile: {
      bio: 'Experienced CNC machinist with a focus on precision aerospace components.',
      skills: ['CNC Machining', 'Blueprint Reading', 'Quality Control'],
      experience: 'Experienced',
      experienceLevel: 'Experienced'
    }
  },
  {
    name: 'Marcus Reed',
    email: 'marcus.reed@example.com',
    password: 'MarcusSkilled!7',
    role: 'jobseeker',
    phone: '+1-206-555-0442',
    primaryHasWhatsApp: false,
    location: 'Tacoma, WA',
    profile: {
      bio: 'Forklift-certified warehouse associate with five years of inventory management experience.',
      skills: ['Forklift Operation', 'Inventory Management', 'Shipping & Receiving'],
      experience: 'Experienced',
      experienceLevel: 'Experienced'
    }
  },
  {
    name: 'Elena Vargas',
    email: 'elena.vargas@example.com',
    password: 'ElenaCareer#9',
    role: 'jobseeker',
    phone: '+1-312-555-0527',
    primaryHasWhatsApp: true,
    location: 'Chicago, IL',
    profile: {
      bio: 'Hospitality supervisor skilled in team leadership and guest services.',
      skills: ['Guest Relations', 'Team Leadership', 'Event Coordination'],
      experience: 'Experienced',
      experienceLevel: 'Experienced'
    }
  },
  {
    name: 'Noah Patel',
    email: 'noah.patel@example.com',
    password: 'NoahBuilds#4',
    role: 'jobseeker',
    phone: '+1-303-555-0612',
    primaryHasWhatsApp: true,
    location: 'Denver, CO',
    profile: {
      bio: 'Apprentice electrician pursuing opportunities in commercial construction projects.',
      skills: ['Electrical Wiring', 'Blueprint Reading', 'Safety Compliance'],
      experience: 'Some Experience',
      experienceLevel: 'Some Experience'
    }
  },
  {
    name: 'Jasmine Lee',
    email: 'jasmine.lee@example.com',
    password: 'JasmineJobs#3',
    role: 'jobseeker',
    phone: '+1-404-555-0728',
    primaryHasWhatsApp: false,
    location: 'Atlanta, GA',
    profile: {
      bio: 'Customer service representative with a passion for helping clients find solutions.',
      skills: ['Customer Support', 'CRM Tools', 'Conflict Resolution'],
      experience: 'Entry Level',
      experienceLevel: 'Entry Level'
    }
  }
];

const jobSeed = [
  {
    employerEmail: 'hiring@atlasmanufacturing.com',
    job: {
      title: 'CNC Machinist',
      description: 'Operate CNC machines to produce precision aerospace components with tight tolerances.',
      requirements: [
        '3+ years of CNC machining experience',
        'Ability to read and interpret technical drawings',
        'Knowledge of precision measuring instruments'
      ],
      responsibilities: [
        'Set up and operate CNC mills and lathes',
        'Perform routine maintenance and inspections',
        'Collaborate with quality team to ensure specifications'
      ],
      category: 'Manufacturing',
      jobType: 'Full-time',
      experienceLevel: '3-5 years',
      salary: {
        min: 28,
        max: 36,
        currency: 'USD',
        period: 'hour'
      },
      location: {
        address: '455 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        remote: false
      },
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      tags: ['CNC', 'Manufacturing', 'Aerospace']
    }
  },
  {
    employerEmail: 'talent@brightlinelogistics.com',
    job: {
      title: 'Warehouse Team Lead',
      description: 'Lead a team of warehouse associates to fulfill daily order volume and ensure safety compliance.',
      requirements: [
        'Supervisory experience in warehouse settings',
        'Forklift certification preferred',
        'Knowledge of inventory management systems'
      ],
      responsibilities: [
        'Coordinate daily picking and shipping activities',
        'Train and mentor new warehouse staff',
        'Maintain accurate inventory records'
      ],
      category: 'Warehouse',
      jobType: 'Full-time',
      experienceLevel: '3-5 years',
      salary: {
        min: 24,
        max: 29,
        currency: 'USD',
        period: 'hour'
      },
      location: {
        address: '908 Western Ave',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98104',
        remote: false
      },
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tags: ['Warehouse', 'Logistics', 'Leadership']
    }
  },
  {
    employerEmail: 'careers@summithospitalitygroup.com',
    job: {
      title: 'Assistant Front Office Manager',
      description: 'Support daily front office operations across Summit Hospitality resorts and ensure exceptional guest service.',
      requirements: [
        '2+ years in hospitality front office roles',
        'Experience with hotel PMS software',
        'Strong communication and leadership skills'
      ],
      responsibilities: [
        'Supervise front desk associates',
        'Handle guest escalations and special requests',
        'Coordinate with housekeeping and events teams'
      ],
      category: 'Hospitality',
      jobType: 'Full-time',
      experienceLevel: '1-2 years',
      salary: {
        min: 45000,
        max: 52000,
        currency: 'USD',
        period: 'year'
      },
      location: {
        address: '1225 Lakeshore Dr',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60611',
        remote: false
      },
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      tags: ['Hospitality', 'Guest Services', 'Management']
    }
  }
];

const connect = () => {
  return mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

const run = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connect();
    console.log('✅ Connected. Cleaning existing demo data...');

    const adminUsers = await User.find({ role: 'admin' }).select('_id email');
    const adminIds = adminUsers.map((admin) => admin._id.toString());

    const jobDeleteResult = await Job.deleteMany({});
    const applicationDeleteResult = await Application.deleteMany({});
    const companyDeleteResult = await Company.deleteMany({});
    const userDeleteResult = await User.deleteMany({ role: { $in: ['jobseeker', 'employer'] } });

    console.log(`🧹 Removed ${userDeleteResult.deletedCount} users, ${companyDeleteResult.deletedCount} companies, ${jobDeleteResult.deletedCount} jobs, and ${applicationDeleteResult.deletedCount} applications.`);

    const createdEmployers = [];
    for (const { user, company } of employersSeed) {
      const employerUser = await User.create(user);
      const employerCompany = await Company.create({
        ...company,
        owner: employerUser._id
      });

      employerUser.company = employerCompany._id;
      await employerUser.save();

      createdEmployers.push({ user: employerUser, company: employerCompany, password: user.password });
      console.log(`🏢 Created employer ${employerUser.name} (${employerUser.email})`);
    }

    const createdJobSeekers = [];
    for (const seeker of jobSeekersSeed) {
      const jobSeekerUser = await User.create(seeker);
      createdJobSeekers.push({ user: jobSeekerUser, password: seeker.password });
      console.log(`👤 Created job seeker ${jobSeekerUser.name} (${jobSeekerUser.email})`);
    }

    const employerByEmail = new Map(createdEmployers.map((entry) => [entry.user.email, entry]));
    const createdJobs = [];

    for (const { employerEmail, job } of jobSeed) {
      const employerEntry = employerByEmail.get(employerEmail);

      if (!employerEntry) {
        console.warn(`⚠️ Skipping job seeding for ${employerEmail} because employer was not created.`);
        continue;
      }

      const jobDoc = await Job.create({
        ...job,
        postedBy: employerEntry.user._id,
        company: employerEntry.company._id
      });

      createdJobs.push(jobDoc);
      console.log(`💼 Created job ${jobDoc.title} for ${employerEntry.company.name}`);
    }

    console.log('\n🎉 Demo data reset complete!');

    console.log('\n📧 Employer Accounts:');
    createdEmployers.forEach(({ user, password }) => {
      console.log(`- ${user.name}: ${user.email} / ${password}`);
    });

    console.log('\n📧 Job Seeker Accounts:');
    createdJobSeekers.forEach(({ user, password }) => {
      console.log(`- ${user.name}: ${user.email} / ${password}`);
    });

    console.log(`\n📝 Jobs created: ${createdJobs.length}`);
    createdJobs.forEach((jobDoc) => {
      console.log(`- ${jobDoc.title} (${jobDoc.location.city}, ${jobDoc.location.state})`);
    });

    if (adminIds.length > 0) {
      console.log('\n🔐 Admin accounts were preserved:');
      adminUsers.forEach((admin) => console.log(`- ${admin.email}`));
    } else {
      console.log('\nℹ️ No admin accounts found to preserve.');
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting demo data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
