/**
 * ============================================
 * THINKIFY API - AUTHENTICATION TESTS
 * ============================================
 * Automated tests for auth endpoints using Jest + Supertest
 * Test Type: Integration Tests (White Box)
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Import models and routes
import { User } from '../models/index.js';
import authRoutes from '../routes/auth.routes.js';

let mongoServer;
let app;

// Setup Express app for testing
const setupApp = () => {
  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  
  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server Error',
    });
  });
  
  return app;
};

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    setupApp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  // ============================================
  // REGISTRATION TESTS
  // ============================================
  describe('POST /api/auth/register', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      displayName: 'Test User',
    };

    test('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('_id');
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.username).toBe(validUser.username);
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    test('should fail with duplicate email', async () => {
      await User.create(validUser);
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should fail with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'invalid-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should fail with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should fail with username containing special characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, username: 'test@user!' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================
  // LOGIN TESTS
  // ============================================
  describe('POST /api/auth/login', () => {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      displayName: 'Test User',
    };

    beforeEach(async () => {
      await User.create(testUser);
    });

    test('should login with valid credentials (email)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    test('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should fail with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================
  // GET CURRENT USER TESTS
  // ============================================
  describe('GET /api/auth/me', () => {
    test('should fail without authentication', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should return user data with valid token', async () => {
      // First register and login
      const userData = {
        username: 'authuser',
        email: 'auth@example.com',
        password: 'Password123!',
        displayName: 'Auth User',
      };

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const cookies = registerRes.headers['set-cookie'];

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(userData.email);
    });
  });

  // ============================================
  // LOGOUT TESTS
  // ============================================
  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ============================================
  // CHECK USERNAME AVAILABILITY TESTS
  // ============================================
  describe('GET /api/auth/check-username/:username', () => {
    test('should return available for new username', async () => {
      const res = await request(app)
        .get('/api/auth/check-username/newuser');

      expect(res.statusCode).toBe(200);
      expect(res.body.available).toBe(true);
    });

    test('should return unavailable for existing username', async () => {
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'Password123!',
      });

      const res = await request(app)
        .get('/api/auth/check-username/existinguser');

      expect(res.statusCode).toBe(200);
      expect(res.body.available).toBe(false);
    });
  });
});
