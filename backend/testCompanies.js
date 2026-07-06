require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  mongoose.set('sanitizeFilter', true);
  
  try {
    const companies = await Company.find({}, '_id name').sort({ name: 1 });
    console.log('Result:', companies);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}
run();
