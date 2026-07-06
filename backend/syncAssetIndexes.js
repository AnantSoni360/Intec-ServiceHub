require('dotenv').config();
const mongoose = require('mongoose');
const Asset = require('./models/Asset');

async function sync() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not found');
    process.exit(1);
  }
  
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  try {
    await Asset.collection.dropIndex('serialNumber_1');
    console.log('Dropped old serialNumber index');
  } catch(e) {
    console.log('No serialNumber_1 index to drop', e.message);
  }

  await Asset.syncIndexes();
  console.log('Indexes synced');
  process.exit(0);
}

sync();
