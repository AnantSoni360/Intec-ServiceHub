require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Asset = require('./models/Asset');

async function countStats() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find Intec company
    const company = await Company.findOne({ name: { $regex: /intec/i } });
    if (!company) {
      console.log('Intec company not found');
      process.exit(1);
    }
    
    console.log(`Found company: ${company.name} (ID: ${company._id})`);
    
    const userCount = await User.countDocuments({ companyId: company._id });
    const ticketCount = await Ticket.countDocuments({ companyId: company._id });
    const assetCount = await Asset.countDocuments({ companyId: company._id });
    
    console.log(`Users: ${userCount}`);
    console.log(`Tickets: ${ticketCount}`);
    console.log(`Assets: ${assetCount}`);
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

countStats();
