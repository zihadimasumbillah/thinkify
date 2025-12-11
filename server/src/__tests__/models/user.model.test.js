/**
 * ============================================
 * THINKIFY API - USER MODEL UNIT TESTS
 * ============================================
 * Unit tests for User model methods and validations
 * Test Type: Unit Tests (White Box)
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../../models/index.js';

let mongoServer;

describe('User Model Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  // ============================================
  // SCHEMA VALIDATION TESTS
  // ============================================
  describe('Schema Validations', () => {
    test('should create user with valid data', async () => {
      const userData = {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'Password123!',
        displayName: 'Valid User',
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
    });

    test('should require username', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should require email', async () => {
      const userData = {
        username: 'testuser',
        password: 'Password123!',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should require password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should enforce unique username', async () => {
      const userData = {
        username: 'uniqueuser',
        email: 'first@example.com',
        password: 'Password123!',
      };

      await User.create(userData);

      await expect(
        User.create({ ...userData, email: 'second@example.com' })
      ).rejects.toThrow();
    });

    test('should enforce unique email', async () => {
      const userData = {
        username: 'firstuser',
        email: 'unique@example.com',
        password: 'Password123!',
      };

      await User.create(userData);

      await expect(
        User.create({ ...userData, username: 'seconduser' })
      ).rejects.toThrow();
    });

    test('should convert email to lowercase', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'TEST@EXAMPLE.COM',
        password: 'Password123!',
      });

      expect(user.email).toBe('test@example.com');
    });

    test('should trim username', async () => {
      const user = await User.create({
        username: '  testuser  ',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(user.username).toBe('testuser');
    });
  });

  // ============================================
  // PASSWORD HASHING TESTS
  // ============================================
  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const password = 'PlainPassword123!';
      const user = await User.create({
        username: 'hashtest',
        email: 'hash@example.com',
        password,
      });

      expect(user.password).not.toBe(password);
      expect(user.password.length).toBeGreaterThan(20);
    });

    test('should not rehash password if not modified', async () => {
      const user = await User.create({
        username: 'norehash',
        email: 'norehash@example.com',
        password: 'Password123!',
      });

      const originalHash = user.password;
      user.displayName = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  // ============================================
  // matchPassword METHOD TESTS
  // ============================================
  describe('matchPassword Method', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'matchtest',
        email: 'match@example.com',
        password: 'CorrectPassword123!',
      });
    });

    test('should return true for correct password', async () => {
      const isMatch = await testUser.matchPassword('CorrectPassword123!');
      expect(isMatch).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const isMatch = await testUser.matchPassword('WrongPassword123!');
      expect(isMatch).toBe(false);
    });

    test('should return false for empty password', async () => {
      const isMatch = await testUser.matchPassword('');
      expect(isMatch).toBe(false);
    });
  });

  // ============================================
  // VIRTUAL FIELDS TESTS
  // ============================================
  describe('Virtual Fields', () => {
    test('should calculate followersCount', async () => {
      const user1 = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'Password123!',
      });

      const user2 = await User.create({
        username: 'user2',
        email: 'user2@example.com',
        password: 'Password123!',
        followers: [user1._id],
      });

      expect(user2.followersCount).toBe(1);
    });

    test('should calculate followingCount', async () => {
      const user1 = await User.create({
        username: 'follower1',
        email: 'follower1@example.com',
        password: 'Password123!',
      });

      const user2 = await User.create({
        username: 'following1',
        email: 'following1@example.com',
        password: 'Password123!',
        following: [user1._id],
      });

      expect(user2.followingCount).toBe(1);
    });
  });

  // ============================================
  // DEFAULT VALUES TESTS
  // ============================================
  describe('Default Values', () => {
    test('should set default role to user', async () => {
      const user = await User.create({
        username: 'defaulttest',
        email: 'default@example.com',
        password: 'Password123!',
      });

      expect(user.role).toBe('user');
    });

    test('should set default isActive to true', async () => {
      const user = await User.create({
        username: 'activetest',
        email: 'active@example.com',
        password: 'Password123!',
      });

      expect(user.isActive).toBe(true);
    });

    test('should initialize empty arrays for followers/following', async () => {
      const user = await User.create({
        username: 'arraytest',
        email: 'array@example.com',
        password: 'Password123!',
      });

      expect(user.followers).toEqual([]);
      expect(user.following).toEqual([]);
      expect(user.bookmarks).toEqual([]);
    });
  });
});
