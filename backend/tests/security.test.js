const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const adminRoutes = require('../routes/admin');
const onboardingRoutes = require('../routes/onboarding');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/onboarding', onboardingRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env.JWT_SECRET = 'test_secret';
  process.env.PLATFORM_ADMIN_EMAIL = 'admin@example.com';
  process.env.PLATFORM_ADMIN_PASSWORD_HASH = await bcrypt.hash('supersecret', 10);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Security and Hardening Tests', () => {
  describe('Platform Admin Login', () => {
    it('should login platform admin with correct credentials', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@example.com',
          password: 'supersecret'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.token).toBeDefined();
    });

    it('should reject platform admin with wrong credentials', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@example.com',
          password: 'wrong'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe('Rate Limiting on Registration', () => {
    it('should rate limit after 5 requests', async () => {
      const makeRequest = () => request(app)
        .post('/api/onboarding/register-and-upload')
        .field('companyName', 'Test Corp ' + Math.random())
        .field('userName', 'Test User')
        .field('email', 'test' + Math.random() + '@test.com')
        .field('password', 'password123')
        .attach('users', Buffer.from('Email,Name\ntest@test.com,Test'), 'users.csv')
        .attach('assets', Buffer.from('Asset Name,Serial Number\nLaptop,123'), 'assets.csv')
        .attach('tickets', Buffer.from('Title,Requested By Email\nFix,test@test.com'), 'tickets.csv');

      for (let i = 0; i < 5; i++) {
        await makeRequest();
      }
      const res = await makeRequest();
      expect(res.statusCode).toEqual(429); // Too Many Requests
    });
  });
});
