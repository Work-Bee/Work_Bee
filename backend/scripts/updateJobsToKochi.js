require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Job = require('../models/Job');

const updates = {
  'Production Worker': {
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
    salary: { min: 18500, max: 23000, currency: 'INR', period: 'month' },
    location: {
      address: 'ABC Manufacturing Plant, Kalamassery Industrial Estate',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '683104',
      remote: false
    },
    tags: ['Entry Level', 'Training Provided', 'Benefits']
  },
  'Cashier': {
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
    salary: { min: 9000, max: 11000, currency: 'INR', period: 'month' },
    location: {
      address: 'Quick Mart Retail, Panampilly Nagar',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682036',
      remote: false
    },
    tags: ['Part-time', 'Flexible Hours', 'Customer Service']
  },
  'Construction Laborer': {
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
    salary: { min: 16500, max: 21000, currency: 'INR', period: 'month' },
    location: {
      address: 'BuildRight Site Office, Infopark Road, Kakkanad',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682030',
      remote: false
    },
    tags: ['Construction', 'Outdoor Work', 'On-the-job Training']
  },
  'Delivery Driver': {
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
    salary: { min: 12000, max: 16000, currency: 'INR', period: 'month' },
    location: {
      address: 'Quick Mart Delivery Hub, Marine Drive',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682011',
      remote: false
    },
    tags: ['Driving', 'Flexible', 'Customer Service']
  },
  'Warehouse Associate': {
    description: 'Join our newest Smart Logistics warehouse near Vallarpadam Container Terminal. We are hiring reliable associates to handle picking, packing, and stock checks for daily shipments across Kochi.',
    requirements: [
      'Ability to lift 20 kilograms repeatedly',
      'Comfort using barcode scanners and basic inventory software',
      'Strong attention to detail for order accuracy',
      'Comfortable working rotating shifts including nights'
    ],
    responsibilities: [
      'Pick and pack orders based on digital pick-lists',
      'Load and unload delivery vehicles safely',
      'Update inventory counts and report discrepancies',
      'Keep aisles and storage racks clean and organised'
    ],
    salary: { min: 17000, max: 22000, currency: 'INR', period: 'month' },
    location: {
      address: 'Smart Logistics Warehouse, Vallarpadam Junction',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682504',
      remote: false
    },
    tags: ['Warehouse', 'Benefits', 'Growth Opportunity']
  },
  'Kitchen Assistant': {
    description: 'SeaBreeze Bistro in Fort Kochi is hiring kitchen assistants to support our chefs during busy lunch and dinner services. We provide food safety training and staff meals every shift.',
    requirements: [
      'Ability to work in a fast-paced kitchen',
      'Comfortable standing for long periods',
      'Basic knife handling skills or willingness to learn',
      'Team player with good communication in Malayalam or English'
    ],
    responsibilities: [
      'Assist chefs with mise en place and prep work',
      'Maintain kitchen cleanliness and sanitise stations',
      'Wash and organise utensils, plates, and cookware',
      'Follow food safety and hygiene protocols at all times'
    ],
    salary: { min: 12000, max: 15000, currency: 'INR', period: 'month' },
    location: {
      address: 'SeaBreeze Bistro, Fort Kochi Beach Road',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682001',
      remote: false
    },
    tags: ['Food Service', 'Entry Level', 'Staff Meals']
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const titles = Object.keys(updates);
    for (const title of titles) {
      const data = updates[title];
      const result = await Job.findOneAndUpdate(
        { title },
        {
          $set: {
            description: data.description,
            requirements: data.requirements,
            responsibilities: data.responsibilities,
            salary: data.salary,
            location: data.location,
            tags: data.tags,
            updatedAt: new Date()
          },
        },
        { new: true }
      );

      if (result) {
        console.log(`✅ Updated job: ${title}`);
      } else {
        console.warn(`⚠️ Could not find job with title: ${title}`);
      }
    }
  } catch (error) {
    console.error('Error updating jobs:', error);
  } finally {
    await mongoose.connection.close();
  }
};

run();
