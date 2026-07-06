require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  
  const users = await User.find({ email: 'karan.nair8@intec-demo.com' });
  console.log('Found', users.length, 'users:');
  users.forEach(u => console.log(`- ID: ${u._id}, Company: ${u.companyId}`));
  
  process.exit(0);
}
check();
