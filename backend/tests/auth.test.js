const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const authRoutes = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe('Auth API Routes', () => {
  it('should prevent login with non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid email or password');
  });

  it('should prevent login with wrong password', async () => {
    // create user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'correctpassword',
      role: 'Employee',
      department: 'IT'
    });
    await user.save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid email or password');
  });
});
