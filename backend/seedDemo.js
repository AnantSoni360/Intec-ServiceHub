require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Company = require('./models/Company');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Check if Intec ServiceHub already exists
    let company = await Company.findOne({ name: 'Intec ServiceHub' });
    
    const hashedPassword = await bcrypt.hash('password123', 10);

    if (!company) {
      // First, create a dummy super admin to own the company
      const superAdmin = new User({
        name: 'Intec Super Admin',
        email: 'super@intec-demo.com',
        password: hashedPassword,
        role: 'super_admin',
        department: 'Management',
        companyId: new mongoose.Types.ObjectId() // temporary
      });
      await superAdmin.save();

      company = new Company({
        name: 'Intec ServiceHub',
        superAdminId: superAdmin._id
      });
      await company.save();

      // Update super admin with correct company id
      superAdmin.companyId = company._id;
      await superAdmin.save();
      console.log('Created Intec ServiceHub company');
    } else {
      console.log('Intec ServiceHub already exists');
    }

    const demoUsers = [
      { name: 'Karan Nair', email: 'karan.nair8@intec-demo.com', role: 'Employee', department: 'Operations' },
      { name: 'Rohan Gowda', email: 'rohan.gowda1@intec-demo.com', role: 'Engineer', department: 'IT' },
      { name: 'Kavita Reddy', email: 'kavita.reddy@intec-demo.com', role: 'Admin', department: 'IT' },
    ];

    for (let u of demoUsers) {
      let existingUser = await User.findOne({ email: u.email, companyId: company._id });
      if (!existingUser) {
        await User.create({
          ...u,
          password: hashedPassword,
          companyId: company._id
        });
        console.log(`Created demo user: ${u.email}`);
      } else {
        console.log(`Demo user already exists: ${u.email}`);
      }
    }

    console.log('Demo seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
