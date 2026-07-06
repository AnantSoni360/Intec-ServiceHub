const mongoose = require('mongoose');

async function test() {
  try {
    const objectIds = ['5f4e3c2b1a0d9c8b7a6f5e4d'].map(id => new mongoose.Types.ObjectId(id));
    console.log(mongoose.trusted({ $in: objectIds }));
  } catch (err) {
    console.error('Error inside test:', err);
  }
}

test();
