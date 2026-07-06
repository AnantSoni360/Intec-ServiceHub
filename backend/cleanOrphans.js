require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Asset = require('./models/Asset');

async function clean() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const usersDeleted = await User.deleteMany({ companyId: { $exists: false } });
  console.log(`Deleted ${usersDeleted.deletedCount} orphaned users`);

  const ticketsDeleted = await Ticket.deleteMany({ companyId: { $exists: false } });
  console.log(`Deleted ${ticketsDeleted.deletedCount} orphaned tickets`);

  const assetsDeleted = await Asset.deleteMany({ companyId: { $exists: false } });
  console.log(`Deleted ${assetsDeleted.deletedCount} orphaned assets`);

  // Also delete users where companyId is explicitly null or undefined
  const usersDeleted2 = await User.deleteMany({ companyId: null });
  console.log(`Deleted ${usersDeleted2.deletedCount} users with null companyId`);

  process.exit(0);
}
clean();
