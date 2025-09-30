const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    
    console.log('🧹 Cleared existing data');

    // Create demo users
    const demoPassword = process.env.SEED_DEMO_PASSWORD || 'demo123';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123';

    const demoJobSeeker = await User.create({
      name: 'John Doe',
      email: 'jobseeker@demo.com',
      password: demoPassword,
      role: 'jobseeker',
      phone: '(555) 123-4567',
      location: 'New York, NY',
      profile: {
        bio: 'Motivated job seeker looking for entry-level opportunities',
        skills: ['Communication', 'Teamwork', 'Reliability', 'Customer Service'],
        experience: 'Entry Level'
      }
    });

    const demoEmployer = await User.create({
      name: 'Jane Smith',
      email: 'employer@demo.com',
      password: demoPassword,
      role: 'employer',
      phone: '(555) 987-6543',
      location: 'Los Angeles, CA'
    });

    const demoAdmin = await User.create({
      name: process.env.ADMIN_SEED_NAME || 'Site Administrator',
      email: process.env.ADMIN_SEED_EMAIL || 'admin@demo.com',
      password: adminPassword,
      role: 'admin',
      phone: process.env.ADMIN_SEED_PHONE || '(555) 000-0000',
      location: process.env.ADMIN_SEED_LOCATION || 'Head Office'
    });

    console.log('👥 Created demo users');

    // Create demo companies
    const companies = [
      {
        name: 'ABC Manufacturing Inc.',
        description: 'Leading manufacturer of consumer goods with over 50 years of experience.',
        website: 'https://abc-manufacturing.com',
        industry: 'Manufacturing',
        size: '201-500',
        location: {
          address: '123 Industrial Blvd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601'
        },
        contactInfo: {
          email: 'hr@abc-manufacturing.com',
          phone: '(312) 555-0123'
        },
        owner: demoEmployer._id
      },
      {
        name: 'Quick Mart Retail',
        description: 'Fast-growing retail chain focused on customer satisfaction.',
        website: 'https://quickmart.com',
        industry: 'Retail',
        size: '51-200',
        location: {
          address: '456 Commerce St',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301'
        },
        contactInfo: {
          email: 'careers@quickmart.com',
          phone: '(512) 555-0456'
        },
        owner: demoEmployer._id
      },
      {
        name: 'City Diner',
        description: 'Family-owned restaurant serving the community for 25 years.',
        industry: 'Food Service',
        size: '11-50',
        location: {
          address: '789 Main St',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202'
        },
        contactInfo: {
          email: 'jobs@citydiner.com',
          phone: '(303) 555-0789'
        },
        owner: demoEmployer._id
      },
      {
        name: 'BuildRight Construction',
        description: 'Construction company specializing in residential and commercial projects.',
        website: 'https://buildright.com',
        industry: 'Construction',
        size: '11-50',
        location: {
          address: '321 Builder Ave',
          city: 'Phoenix',
          state: 'AZ',
          zipCode: '85001'
        },
        contactInfo: {
          email: 'hiring@buildright.com',
          phone: '(602) 555-0321'
        },
        owner: demoEmployer._id
      }
    ];

    const createdCompanies = await Company.insertMany(companies);
    console.log(`🏢 Created ${createdCompanies.length} demo companies`);

    // Update employer's company reference
    await User.findByIdAndUpdate(demoEmployer._id, { company: createdCompanies[0]._id });

    // Create demo jobs
    const jobs = [
      {
        title: 'Production Worker',
        description: 'ABC Manufacturing is expanding our Kochi plant and looking for dependable production workers to join our Kalamassery line. You will rotate across packing, machine monitoring, and quality checks with on-the-job coaching from our supervisors.',
        requirements: [
          'Ability to lift 25 kilograms safely',
          'Comfortable standing for 8-hour shifts',
          'Basic math and measurement skills',
          'Attention to detail with safety-first mindset',
          'Ready to work morning or evening shifts'
        ],
        responsibilities: [
          'Operate automated filling and sealing machines',
          'Conduct hourly quality inspections and record results',
          'Load finished goods onto pallets and update inventory sheets',
          'Maintain a clean, hazard-free work area',
          'Report maintenance issues to shift supervisor promptly'
        ],
        category: 'Manufacturing',
        jobType: 'Full-time',
        experienceLevel: 'Entry Level',
        salary: {
          min: 18500,
          max: 23000,
          currency: 'INR',
          period: 'month'
        },
        location: {
          address: 'ABC Manufacturing Plant, Kalamassery Industrial Estate',
          city: 'Kochi',
          state: 'Kerala',
          zipCode: '683104',
          remote: false
        },
        company: createdCompanies[0]._id,
        postedBy: demoEmployer._id,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        featured: true,
        tags: ['Entry Level', 'Training Provided', 'Benefits']
      },
      {
        title: 'Cashier',
        description: 'Quick Mart is opening a refreshed neighbourhood store in Panampilly Nagar and we need energetic cashiers who love helping customers. You will handle billing at the POS, assist with digital payments, and keep the front-end running smoothly.',
        requirements: [
          'Higher secondary certificate (plus two) preferred',
          'Comfortable using POS systems and UPI payments',
          'Friendly communicator in English and Malayalam',
          'Customer-first mindset with punctual attendance'
        ],
        responsibilities: [
          'Greet shoppers and process cash, card, and UPI transactions',
          'Bag groceries efficiently and assist with home delivery pickups',
          'Reconcile till at shift end and maintain accurate records',
          'Keep checkout counters stocked and sanitised',
          'Support store promotions and loyalty sign-ups'
        ],
        category: 'Retail',
        jobType: 'Part-time',
        experienceLevel: 'Entry Level',
        salary: {
          min: 9000,
          max: 11000,
          currency: 'INR',
          period: 'month'
        },
        location: {
          address: 'Quick Mart Retail, Panampilly Nagar',
          city: 'Kochi',
          state: 'Kerala',
          zipCode: '682036',
          remote: false
        },
        company: createdCompanies[1]._id,
        postedBy: demoEmployer._id,
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        featured: true,
        tags: ['Part-time', 'Flexible Hours', 'Customer Service']
      },
      {
        title: 'Kitchen Assistant',
        description: 'Join our kitchen team as a Kitchen Assistant! Great opportunity for those looking to enter the food service industry. We offer flexible schedules and advancement opportunities.',
        requirements: [
          'Ability to work in fast-paced environment',
          'Physical stamina for standing long periods',
          'Team player attitude',
          'Food safety knowledge preferred'
        ],
        responsibilities: [
          'Assist chefs with food preparation',
          'Maintain kitchen cleanliness',
          'Follow food safety protocols',
          'Wash dishes and utensils'
        ],
        category: 'Food Service',
        jobType: 'Full-time',
        experienceLevel: 'Entry Level',
        salary: {
          min: 15,
          max: 18,
          period: 'hour'
        },
        location: {
          address: '789 Main St',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202',
          remote: false
        },
        company: createdCompanies[2]._id,
        postedBy: demoEmployer._id,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        featured: false,
        tags: ['Food Service', 'Entry Level', 'Flexible Schedule']
      },
      {
        title: 'Construction Laborer',
        description: 'BuildRight Construction is staffing up for a rapid expansion project at Infopark Kakkanad. We welcome freshers who are eager to learn formwork, concreting, and site safety basics under the guidance of our senior supervisors.',
        requirements: [
          'Physically fit to lift 30 kilograms and climb scaffolding',
          'Comfortable working outdoors in varying weather',
          'Basic understanding of Malayalam or English instructions',
          'Reliable daily commute to Kakkanad job site',
          'Commitment to wearing PPE at all times'
        ],
        responsibilities: [
          'Assist masons and carpenters with material handling',
          'Mix concrete, sand, and aggregates to specified ratios',
          'Set up and dismantle temporary scaffolding safely',
          'Keep work areas clean and dispose waste responsibly',
          'Report safety hazards to the site engineer immediately'
        ],
        category: 'Construction',
        jobType: 'Full-time',
        experienceLevel: 'Entry Level',
        salary: {
          min: 16500,
          max: 21000,
          currency: 'INR',
          period: 'month'
        },
        location: {
          address: 'BuildRight Site Office, Infopark Road, Kakkanad',
          city: 'Kochi',
          state: 'Kerala',
          zipCode: '682030',
          remote: false
        },
        company: createdCompanies[3]._id,
        postedBy: demoEmployer._id,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        featured: true,
        tags: ['Construction', 'Outdoor Work', 'On-the-job Training']
      },
      {
        title: 'Warehouse Associate',
        description: 'Join our warehouse team! We are looking for detail-oriented individuals to help with inventory management and order fulfillment. Great benefits package included.',
        requirements: [
          'Ability to lift 40+ pounds',
          'Basic computer skills',
          'Attention to detail',
          'Team player'
        ],
        responsibilities: [
          'Pick and pack orders',
          'Inventory management',
          'Operating warehouse equipment',
          'Quality control checks'
        ],
        category: 'Warehouse',
        jobType: 'Full-time',
        experienceLevel: 'Entry Level',
        salary: {
          min: 17,
          max: 21,
          period: 'hour'
        },
        location: {
          address: '123 Industrial Blvd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          remote: false
        },
        company: createdCompanies[0]._id,
        postedBy: demoEmployer._id,
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        featured: false,
        tags: ['Warehouse', 'Benefits', 'Growth Opportunity']
      },
      {
        title: 'Delivery Driver',
        description: 'Quick Mart Retail needs punctual delivery drivers to support our same-day orders across central Kochi. You will cover routes in Fort Kochi, Kadavanthra, and Kakkanad using company scooters or your own bike with fuel allowance.',
        requirements: [
          'Valid LMV 2-wheeler licence issued in Kerala',
          'Clean driving history for the past 12 months',
          'Smartphone with Google Maps or similar navigation',
          'Ability to converse with customers in Malayalam',
          'Own two-wheeler is an advantage (fuel paid)'
        ],
        responsibilities: [
          'Collect packed orders from Panampilly hub and deliver within 60 minutes',
          'Handle digital payments and collect cash on delivery when required',
          'Update delivery status through our rider mobile app',
          'Perform basic vehicle safety checks before each shift',
          'Represent Quick Mart with professional customer service'
        ],
        category: 'Delivery',
        jobType: 'Part-time',
        experienceLevel: 'Entry Level',
        salary: {
          min: 12000,
          max: 16000,
          currency: 'INR',
          period: 'month'
        },
        location: {
          address: 'Quick Mart Delivery Hub, Marine Drive',
          city: 'Kochi',
          state: 'Kerala',
          zipCode: '682011',
          remote: false
        },
        company: createdCompanies[1]._id,
        postedBy: demoEmployer._id,
        applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        featured: true,
        tags: ['Driving', 'Flexible', 'Customer Service']
      }
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log(`💼 Created ${createdJobs.length} demo jobs`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Account Credentials:');
    console.log('Job Seeker:');
    console.log('  Email: jobseeker@demo.com');
  console.log(`  Password: ${demoPassword}`);
    console.log('\nEmployer:');
    console.log('  Email: employer@demo.com');
  console.log(`  Password: ${demoPassword}`);
  console.log('\nAdmin:');
  console.log(`  Email: ${demoAdmin.email}`);
  console.log(`  Password: ${adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();