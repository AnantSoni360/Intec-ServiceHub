require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

if (process.env.NODE_ENV === 'production') {
  console.error("DANGER: Cannot run wipe script in production mode.");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function wipe() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not found');
    process.exit(1);
  }
  
  rl.question('WARNING: This will completely WIPE the local database. Are you sure? (y/N): ', async (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Database wipe aborted.');
      process.exit(0);
    }

    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to DB');

      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
        console.log(`Cleared ${key}`);
      }
      
      console.log('Database wiped successfully');
      process.exit(0);
    } catch (err) {
      console.error('Error during wipe:', err);
      process.exit(1);
    }
  });
}

wipe();
