import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Connect to in-memory database before tests
export const setupTestDB = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });
};

// Helper to create test user
export const createTestUser = async (User, userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    displayName: 'Test User',
    ...userData,
  };
  return await User.create(defaultUser);
};

// Helper to create test category
export const createTestCategory = async (Category, categoryData = {}) => {
  const defaultCategory = {
    name: 'Test Category',
    slug: 'test-category',
    description: 'A test category',
    color: '#4ADE80',
    ...categoryData,
  };
  return await Category.create(defaultCategory);
};

// Helper to create test post
export const createTestPost = async (Post, postData = {}) => {
  const defaultPost = {
    title: 'Test Post Title',
    content: 'This is test content for the post. It needs to be at least 20 characters.',
    tags: ['test', 'automation'],
    ...postData,
  };
  return await Post.create(defaultPost);
};
