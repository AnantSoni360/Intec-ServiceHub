require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Company = require('./models/Company');

async function inspectTickets() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const company = await Company.findOne({ name: 'Intec ServiceHub' });
    
    const engineer = await User.findOne({ email: 'amit.iyer1@intec-demo.com' });
    console.log(`Engineer ID: ${engineer._id}`);
    
    const allTickets = await Ticket.countDocuments({ companyId: company._id });
    const engineerTickets = await Ticket.countDocuments({ companyId: company._id, assignedTo: engineer._id });
    const nullTickets = await Ticket.countDocuments({ companyId: company._id, assignedTo: null });
    const existsFalseTickets = await Ticket.countDocuments({ companyId: company._id, assignedTo: { $exists: false } });
    
    console.log(`Total Tickets: ${allTickets}`);
    console.log(`Tickets assigned to engineer: ${engineerTickets}`);
    console.log(`Tickets assigned to null: ${nullTickets}`);
    console.log(`Tickets assigned to { $exists: false }: ${existsFalseTickets}`);

    // Let's print one ticket to see its structure
    const sample = await Ticket.findOne({ companyId: company._id });
    console.log('Sample ticket:', sample);
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspectTickets();
