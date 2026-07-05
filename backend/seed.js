require('dotenv').config();
const mongoose = require('mongoose');
const { initializeData } = require('./csvLoader');

const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Asset = require('./models/Asset');

async function seedDatabase() {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL ERROR: Refusing to run seed script in production environment. This would wipe all data.');
      process.exit(1);
    }

    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<db_password>')) {
      console.error('ERROR: Please update your .env file with your actual MongoDB password!');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('Connected to MongoDB.');

    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Asset.deleteMany({});
    
    console.log('Loading CSV data...');
    const data = await initializeData();

    console.log('Seeding Users...');
    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('password123', 10);
    const createdUsers = await User.insertMany(data.users.map(u => ({
      name: u.name,
      email: u.email,
      password: defaultPassword,
      role: u.role,
      department: u.department
    })));

    // Create a map of email to MongoDB ObjectId
    const userMap = {};
    createdUsers.forEach(u => {
      userMap[u.email] = u._id;
    });

    console.log('Seeding Tickets...');
    // We need to reload tickets directly from CSV mapping because initializeData gave them our old internal IDs 
    // Wait, let's just use initializeData's users mapping? No, initializeData returned users with string IDs.
    // Let's modify seed.js to map original emails if possible. 
    // Actually, initializeData in csvLoader maps requestedBy and assignedTo to the old internal ID.
    // It's easier to find the old ID to email, then email to new Mongo ID.
    const oldIdToEmail = {};
    data.users.forEach(u => {
      oldIdToEmail[u.id] = u.email;
    });

    // We need to fallback orphaned tickets to a default user since we truncated the users list to 250
    const fallbackUserId = createdUsers[0]._id; // Default to John Doe

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
        assignedTo: userMap[assignedEmail] || null
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
        assignedTo: userMap[assignedEmail] || null
      };
    });

    await Asset.insertMany(assetsToInsert);

    console.log(`Successfully seeded ${createdUsers.length} Users, ${ticketsToInsert.length} Tickets, and ${assetsToInsert.length} Assets.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
