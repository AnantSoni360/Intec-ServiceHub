const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const ticketRoutes = require('../routes/tickets');

const app = express();
app.use(express.json());
// Mock req.user for tickets routes (it relies on auth middleware usually, so we'll stub it here or use a real token)
app.use((req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'testsecret');
    } catch(e) {}
  }
  next();
});
app.use('/api/tickets', ticketRoutes);

let mongoServer;
let adminToken;
let adminId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const adminUser = new User({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'password',
    role: 'Admin',
    department: 'IT'
  });
  await adminUser.save();
  adminId = adminUser._id.toString();
  adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe('Ticket API Routes', () => {
  it('should create a new ticket', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'My Test Ticket')
      .field('description', 'Test Description')
      .field('priority', 'Medium')
      .field('category', 'Hardware');
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual('My Test Ticket');
    expect(res.body.requestedBy.toString()).toEqual(adminId);
  });

  it('should fetch tickets for admin', async () => {
    // Create a dummy ticket
    const ticket = new Ticket({
      title: 'Dummy Ticket',
      description: 'Dummy',
      requestedBy: adminId,
      priority: 'Medium'
    });
    await ticket.save();

    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toEqual('Dummy Ticket');
  });
});
