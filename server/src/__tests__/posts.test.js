/**
 * ============================================
 * THINKIFY API - POST ENDPOINT TESTS
 * ============================================
 * Automated tests for post CRUD operations
 * Test Type: Integration Tests (White Box)
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Import models and routes
import { User, Post, Category } from '../models/index.js';
import postRoutes from '../routes/post.routes.js';
import authRoutes from '../routes/auth.routes.js';

let mongoServer;
let app;
let authCookies;
let testUser;
let testCategory;

// Setup Express app
const setupApp = () => {
  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server Error',
    });
  });
  
  return app;
};

describe('Posts API Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    setupApp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections
    await User.deleteMany({});
    await Post.deleteMany({});
    await Category.deleteMany({});

    // Create test category
    testCategory = await Category.create({
      name: 'Technology',
      slug: 'technology',
      description: 'Tech posts',
      color: '#4ADE80',
    });

    // Register and login test user
    const userData = {
      username: 'postuser',
      email: 'post@example.com',
      password: 'Password123!',
      displayName: 'Post User',
    };

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authCookies = registerRes.headers['set-cookie'];
    testUser = registerRes.body.data.user;
  });

  // ============================================
  // CREATE POST TESTS
  // ============================================
  describe('POST /api/posts', () => {
    const validPost = {
      title: 'Test Post Title Here',
      content: 'This is the content of the test post. It needs to be at least 20 characters long to pass validation.',
      tags: ['test', 'automation'],
    };

    test('should create a post successfully', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Cookie', authCookies)
        .send({ ...validPost, category: testCategory._id });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(validPost.title);
      expect(res.body.data.author._id).toBe(testUser._id);
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ ...validPost, category: testCategory._id });

      expect(res.statusCode).toBe(401);
    });

    test('should fail with missing title', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Cookie', authCookies)
        .send({ content: validPost.content, category: testCategory._id });

      expect(res.statusCode).toBe(400);
    });

    test('should fail with short content', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Cookie', authCookies)
        .send({ ...validPost, content: 'Short', category: testCategory._id });

      expect(res.statusCode).toBe(400);
    });

    test('should auto-generate slug from title', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Cookie', authCookies)
        .send({ ...validPost, category: testCategory._id });

      expect(res.body.data.slug).toBe('test-post-title-here');
    });
  });

  // ============================================
  // GET POSTS TESTS
  // ============================================
  describe('GET /api/posts', () => {
    beforeEach(async () => {
      // Create multiple test posts
      const posts = [
        { title: 'First Post', content: 'Content for first post that is long enough.', category: testCategory._id, author: testUser._id },
        { title: 'Second Post', content: 'Content for second post that is long enough.', category: testCategory._id, author: testUser._id },
        { title: 'Third Post', content: 'Content for third post that is long enough.', category: testCategory._id, author: testUser._id },
      ];
      await Post.insertMany(posts);
    });

    test('should return all posts with pagination', async () => {
      const res = await request(app).get('/api/posts');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.pagination).toBeDefined();
    });

    test('should support pagination with limit', async () => {
      const res = await request(app)
        .get('/api/posts')
        .query({ limit: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(3);
    });

    test('should support pagination with page', async () => {
      const res = await request(app)
        .get('/api/posts')
        .query({ limit: 2, page: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    test('should filter by category', async () => {
      const newCategory = await Category.create({
        name: 'Science',
        slug: 'science',
        description: 'Science posts',
      });

      await Post.create({
        title: 'Science Post',
        content: 'A science post with enough content here.',
        category: newCategory._id,
        author: testUser._id,
      });

      const res = await request(app)
        .get('/api/posts')
        .query({ category: newCategory._id });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Science Post');
    });

    test('should search posts by title', async () => {
      const res = await request(app)
        .get('/api/posts')
        .query({ search: 'First' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('First Post');
    });
  });

  // ============================================
  // GET SINGLE POST TESTS
  // ============================================
  describe('GET /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        title: 'Single Post Test',
        content: 'Content for single post that is long enough to test.',
        category: testCategory._id,
        author: testUser._id,
      });
    });

    test('should return a single post by ID', async () => {
      const res = await request(app)
        .get(`/api/posts/${testPost._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Single Post Test');
    });

    test('should increment view count on access', async () => {
      await request(app).get(`/api/posts/${testPost._id}`);
      await request(app).get(`/api/posts/${testPost._id}`);

      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost.views).toBeGreaterThanOrEqual(2);
    });

    test('should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/posts/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });

    test('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/posts/invalid-id');

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // UPDATE POST TESTS
  // ============================================
  describe('PUT /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        title: 'Update Test Post',
        content: 'Content for update test post that is long enough.',
        category: testCategory._id,
        author: testUser._id,
      });
    });

    test('should update post successfully', async () => {
      const res = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Cookie', authCookies)
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toBe(401);
    });

    test('should fail for non-owner', async () => {
      // Create another user
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'otheruser',
          email: 'other@example.com',
          password: 'Password123!',
        });

      const res = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Cookie', otherUserRes.headers['set-cookie'])
        .send({ title: 'Hacked Title' });

      expect(res.statusCode).toBe(403);
    });
  });

  // ============================================
  // DELETE POST TESTS
  // ============================================
  describe('DELETE /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        title: 'Delete Test Post',
        content: 'Content for delete test post that is long enough.',
        category: testCategory._id,
        author: testUser._id,
      });
    });

    test('should delete post successfully', async () => {
      const res = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Cookie', authCookies);

      expect(res.statusCode).toBe(200);

      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .delete(`/api/posts/${testPost._id}`);

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================
  // LIKE/UNLIKE POST TESTS
  // ============================================
  describe('POST /api/posts/:id/like', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        title: 'Like Test Post',
        content: 'Content for like test post that is long enough.',
        category: testCategory._id,
        author: testUser._id,
      });
    });

    test('should like a post', async () => {
      const res = await request(app)
        .post(`/api/posts/${testPost._id}/like`)
        .set('Cookie', authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.isLiked).toBe(true);
    });

    test('should unlike a previously liked post', async () => {
      // First like
      await request(app)
        .post(`/api/posts/${testPost._id}/like`)
        .set('Cookie', authCookies);

      // Then unlike
      const res = await request(app)
        .post(`/api/posts/${testPost._id}/like`)
        .set('Cookie', authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.isLiked).toBe(false);
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .post(`/api/posts/${testPost._id}/like`);

      expect(res.statusCode).toBe(401);
    });
  });
});
