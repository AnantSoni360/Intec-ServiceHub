require('dotenv').config();
const mongoose = require('mongoose');
const { initializeData } = require('./csvLoader');

const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Asset = require('./models/Asset');
const Company = require('./models/Company');

async function seedDatabase() {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL ERROR: Refusing to run seed script in production environment.');
      process.exit(1);
    }

    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<db_password>')) {
      console.error('ERROR: Please update your .env file with your actual MongoDB password!');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('Connected to MongoDB.');

    // We will ONLY seed data for the "Intec ServiceHub" company to avoid wiping other companies
    const company = await Company.findOne({ name: 'Intec ServiceHub' });
    if (!company) {
      console.error('Error: Intec ServiceHub company not found. Run seedDemo.js first.');
      process.exit(1);
    }

    console.log(`Clearing existing users, tickets and assets for company: ${company._id}`);
    await User.deleteMany({ companyId: company._id });
    await Ticket.deleteMany({ companyId: company._id });
    await Asset.deleteMany({ companyId: company._id });
    
    console.log('Loading CSV data...');
    const data = await initializeData();

    console.log('Seeding Users...');
    // We already have some demo users from seedDemo.js, but let's grab the rest of the CSV users
    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    // Check which users already exist for this company
    const existingUsers = await User.find({ companyId: company._id });
    const existingEmails = new Set(existingUsers.map(u => u.email));

    const newUsersToInsert = data.users
      .filter(u => !existingEmails.has(u.email))
      .map(u => ({
        name: u.name,
        email: u.email,
        password: defaultPassword,
        role: u.role,
        department: u.department,
        companyId: company._id
      }));

    if (newUsersToInsert.length > 0) {
      await User.insertMany(newUsersToInsert);
    }

    // Refetch all users to build map
    const allUsers = await User.find({ companyId: company._id });
    const userMap = {};
    allUsers.forEach(u => {
      userMap[u.email] = u._id;
    });

    console.log('Seeding Tickets...');
    const oldIdToEmail = {};
    data.users.forEach(u => {
      oldIdToEmail[u.id] = u.email;
    });

    const fallbackUserId = allUsers[0]._id;

    const ticketsToInsert = data.tickets.map(t => {
      const requestedEmail = oldIdToEmail[t.requestedBy];
      const assignedEmail = oldIdToEmail[t.assignedTo];
      return {
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt,
        requestedBy: userMap[requestedEmail] || fallbackUserId,
        assignedTo: userMap[assignedEmail] || null,
        companyId: company._id
      };
    });

    await Ticket.insertMany(ticketsToInsert);

    console.log('Seeding Assets...');
    const assetsToInsert = data.assets.map(a => {
      const assignedEmail = oldIdToEmail[a.assignedTo];
      return {
        name: a.name,
        type: ['Laptop', 'Desktop', 'Printer', 'Network', 'Monitor'].includes(a.type) ? a.type : (a.type === 'Server' ? 'Network' : 'Other'),
        serialNumber: a.serialNumber,
        status: a.status === 'Under Maintenance' ? 'Maintenance' : (['Available', 'Assigned', 'Maintenance', 'Retired'].includes(a.status) ? a.status : 'Available'),
        assignedTo: userMap[assignedEmail] || null,
        companyId: company._id
      };
    });

    await Asset.insertMany(assetsToInsert);

    console.log(`Successfully seeded ${newUsersToInsert.length} additional Users, ${ticketsToInsert.length} Tickets, and ${assetsToInsert.length} Assets for Intec ServiceHub.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
