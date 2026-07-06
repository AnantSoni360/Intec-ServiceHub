require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function sync() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not found');
    process.exit(1);
  }
  
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  try {
    await User.collection.dropIndex('email_1');
    console.log('Dropped old email index');
  } catch(e) {
    console.log('No email_1 index to drop', e.message);
  }

  await User.syncIndexes();
  console.log('Indexes synced');
  process.exit(0);
}

sync();
