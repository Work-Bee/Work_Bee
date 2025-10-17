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
      name: 'ABC Manufacturing Kochi',
      email: 'hiring@abc-mfg.in',
      password: 'AbcMfg#2025',
      role: 'employer',
      phone: '0484-295-0101',
      primaryHasWhatsApp: true,
      location: 'Kochi, Kerala',
      companyDetails: {
        companyName: 'ABC Manufacturing Pvt Ltd',
        industry: 'Manufacturing',
  companySize: '200+',
        website: 'https://abc-manufacturing.in'
      }
    },
    company: {
      name: 'ABC Manufacturing Pvt Ltd',
      description: 'Consumer goods manufacturing unit in Kalamassery Industrial Estate.',
      website: 'https://abc-manufacturing.in',
      industry: 'Manufacturing',
  size: '201-500',
      location: {
        address: 'Kalamassery Industrial Estate',
        city: 'Kochi',
        state: 'Kerala',
        zipCode: '683104'
      },
      contactInfo: {
        email: 'hr@abc-manufacturing.in',
        phone: '0484-295-0101'
      }
    }
  },
  {
    user: {
      name: 'Brightline Logistics Kochi',
      email: 'talent@brightline.in',
      password: 'Brightline!2025',
      role: 'employer',
      phone: '0484-295-0202',
      primaryHasWhatsApp: true,
      location: 'Kochi, Kerala',
      companyDetails: {
        companyName: 'Brightline Logistics',
        industry: 'Transportation',
  companySize: '51-200',
        website: 'https://brightline.in'
      }
    },
    company: {
      name: 'Brightline Logistics',
      description: 'Kerala logistics provider specializing in last-mile delivery services.',
      website: 'https://brightline.in',
      industry: 'Transportation',
  size: '51-200',
      location: {
        address: 'Kaloor',
        city: 'Kochi',
        state: 'Kerala',
        zipCode: '682017'
      },
      contactInfo: {
        email: 'hr@brightline.in',
        phone: '0484-295-0202'
      }
    }
  },
  {
    user: {
      name: 'Summit Hospitality Kochi',
      email: 'careers@summithospitality.in',
      password: 'SummitStay#88',
      role: 'employer',
      phone: '0484-295-0303',
      primaryHasWhatsApp: false,
      location: 'Kochi, Kerala',
      companyDetails: {
        companyName: 'Summit Hospitality Group',
        industry: 'Food Service',
  companySize: '11-50',
        website: 'https://summithospitality.in'
      }
    },
    company: {
      name: 'Summit Hospitality Group',
      description: 'Boutique hotel and restaurant group in Kochi focused on guest experiences.',
      website: 'https://summithospitality.in',
      industry: 'Hospitality',
      size: '11-50',
      location: {
        address: 'MG Road',
        city: 'Kochi',
        state: 'Kerala',
        zipCode: '682001'
      },
      contactInfo: {
        email: 'hello@summithospitality.in',
        phone: '0484-295-0303'
      }
    }
  }
];

const jobSeekersSeed = [
  {
    name: 'Anu Nair',
    email: 'anu.nair@example.com',
    password: 'AnuWork#25',
    role: 'jobseeker',
    phone: '98470 12345',
    primaryHasWhatsApp: true,
    location: 'Kochi, Kerala',
    profile: {
      bio: 'Entry-level warehouse associate looking to start in Kochi.',
      skills: ['Teamwork', 'Punctuality', 'Inventory Basics'],
      experience: 'Entry Level',
      experienceLevel: 'Entry Level'
    }
  },
  {
    name: 'Vishnu Raj',
    email: 'vishnu.raj@example.com',
    password: 'Vishnu#2025',
    role: 'jobseeker',
    phone: '98950 22222',
    primaryHasWhatsApp: true,
    location: 'Thrissur, Kerala',
    profile: {
      bio: 'Delivery executive with knowledge of routes in central Kochi.',
      skills: ['Driving', 'Maps', 'Customer Service'],
      experience: 'Some Experience',
      experienceLevel: 'Some Experience'
    }
  },
  {
    name: 'Fathima Shereef',
    email: 'fathima.shereef@example.com',
    password: 'Fathima@2025',
    role: 'jobseeker',
    phone: '97450 33333',
    primaryHasWhatsApp: true,
    location: 'Kochi, Kerala',
    profile: {
      bio: 'Hospitality trainee interested in front office roles.',
      skills: ['Guest Relations', 'Communication'],
      experience: 'Entry Level',
      experienceLevel: 'Entry Level'
    }
  }
];

const jobSeed = [
  {
    employerEmail: 'hiring@abc-mfg.in',
    job: {
      title: 'Production Worker',
      description: 'Assist in production line operations at Kalamassery unit. Training provided.',
      requirements: [
        'Ability to lift 20kg',
        '8-hour standing shifts',
        'Safety-first approach'
      ],
      responsibilities: [
        'Operate machinery and pack finished goods',
        'Perform quality checks and maintain logs',
        'Keep work area clean and safe'
      ],
  category: 'Manufacturing',
  employmentType: 'Full-time',
  duration: 'Permanent',
  jobType: 'Full-time',
      experienceLevel: 'Entry Level',
      salary: {
        min: 18500,
        max: 23000,
        currency: 'INR',
        period: 'month'
      },
      location: {
        address: 'Kalamassery Industrial Estate',
        city: 'Kochi',
        state: 'Kerala',
        zipCode: '683104',
        remote: false
      },
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      tags: ['Manufacturing', 'Entry Level', 'Training']
    }
  },
  {
    employerEmail: 'talent@brightline.in',
    job: {
      title: 'Warehouse Associate',
      description: 'Assist with picking, packing and inventory at Kaloor warehouse.',
      requirements: [
        'Basic computer skills',
        'Attention to detail',
        'Team player'
      ],
      responsibilities: [
        'Pick and pack orders',
        'Maintain stock levels',
        'Update inventory records'
      ],
  category: 'Warehouse',
  employmentType: 'Full-time',
  duration: 'Permanent',
  jobType: 'Full-time',
      experienceLevel: 'Entry Level',
      salary: {
        min: 18000,
        max: 22000,
        currency: 'INR',
        period: 'month'
      },
      location: {
        address: 'Kaloor',
        city: 'Kochi',
        state: 'Kerala',
        zipCode: '682017',
        remote: false
      },
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tags: ['Warehouse', 'Logistics']
    }
  },
  {
    employerEmail: 'careers@summithospitality.in',
    job: {
      title: 'Front Office Assistant',
      description: 'Assist front office at hotel on MG Road, Kochi and support guest services.',
      requirements: [
        'Good communication skills',
        'Basic computer knowledge',
        'Customer-first attitude'
      ],
      responsibilities: [
        'Greet guests and handle check-in/out',
        'Support billing and call handling',
        'Coordinate with housekeeping'
      ],
  category: 'Hospitality',
  employmentType: 'Full-time',
  duration: 'Permanent',
  jobType: 'Full-time',
      experienceLevel: 'Entry Level',
      salary: {
        min: 12000,
        max: 16000,
        currency: 'INR',
        period: 'month'
      },
      location: {
        address: 'MG Road',
        city: 'Kochi',
        state: 'Kerala',
        zipCode: '682001',
        remote: false
      },
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      tags: ['Hospitality', 'Guest Services']
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
