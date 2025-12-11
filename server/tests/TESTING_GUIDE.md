# 🧪 Thinkify Testing Guide

Complete testing instructions for the Thinkify application.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Automated Testing](#automated-testing)
3. [Manual Testing](#manual-testing)
4. [Test Coverage](#test-coverage)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Dependencies

```bash
# Backend dependencies
cd /Users/masumbillahzihadi/PROJECTS/thinkify/server
npm install

# Frontend dependencies (optional for E2E)
cd /Users/masumbillahzihadi/PROJECTS/thinkify/client
npm install
```

### 2. Seed Test Data

```bash
cd /Users/masumbillahzihadi/PROJECTS/thinkify/server
npm run seed
```

This creates:
- 📂 8 Categories
- 👥 7 Users (including demo account)
- 📝 8 Posts with content
- 💬 10 Comments

### 3. Test Credentials

| Account | Email | Password |
|---------|-------|----------|
| **Demo** | demo@thinkify.com | demo123 |
| **Alex** | alex@example.com | Password123! |
| **Sarah** | sarah@example.com | Password123! |

---

## Automated Testing

### Run All Tests

```bash
cd /Users/masumbillahzihadi/PROJECTS/thinkify/server
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
# Auth tests only
npm test -- src/__tests__/auth.test.js

# Post tests only
npm test -- src/__tests__/posts.test.js

# Model tests only
npm test -- src/__tests__/models/user.model.test.js
```

### Test Output Example

```
 PASS  src/__tests__/auth.test.js
  Authentication API Tests
    POST /api/auth/register
      ✓ should register a new user successfully (45ms)
      ✓ should fail with duplicate email (12ms)
      ✓ should fail with invalid email format (8ms)
      ✓ should fail with short password (6ms)
    POST /api/auth/login
      ✓ should login with valid credentials (23ms)
      ✓ should fail with wrong password (15ms)

Test Suites: 3 passed, 3 total
Tests:       25 passed, 25 total
Time:        4.532s
```

---

## Manual Testing

### Documentation Location

```
/thinkify/server/tests/
├── MANUAL_TESTING_WHITEBOX.md   # Internal code testing
├── MANUAL_TESTING_BLACKBOX.md   # Functional testing
└── TESTING_GUIDE.md             # This file
```

### White Box Testing

Tests internal code structure and logic:
- Password hashing verification
- JWT token generation
- Database queries
- Middleware logic
- Validation rules

**Run White Box Tests:**
1. Open `MANUAL_TESTING_WHITEBOX.md`
2. Follow test cases WB-AUTH-001 through WB-VAL-003
3. Use code snippets provided to verify behavior

### Black Box Testing

Tests application functionality without code knowledge:
- User registration/login
- Post CRUD operations
- Comments system
- User profiles
- UI/UX validation

**Run Black Box Tests:**
1. Start the application (see below)
2. Open `MANUAL_TESTING_BLACKBOX.md`
3. Execute test cases BB-AUTH-001 through UI-004
4. Record results in the template provided

### Start Application for Manual Testing

```bash
# Terminal 1: Start MongoDB (if using local)
brew services start mongodb-community

# Terminal 2: Start Backend
cd /Users/masumbillahzihadi/PROJECTS/thinkify/server
npm run dev

# Terminal 3: Start Frontend
cd /Users/masumbillahzihadi/PROJECTS/thinkify/client
npm run dev
```

Open: http://localhost:5173

---

## Test Categories

### Unit Tests
Test individual functions/methods in isolation.

| File | Tests |
|------|-------|
| `user.model.test.js` | Password hashing, validations, virtuals |

### Integration Tests
Test API endpoints with database.

| File | Tests |
|------|-------|
| `auth.test.js` | Register, login, logout, token verification |
| `posts.test.js` | CRUD operations, likes, pagination |

### Manual Tests
Human verification of UI/UX and flows.

| File | Tests |
|------|-------|
| `MANUAL_TESTING_WHITEBOX.md` | Code path verification |
| `MANUAL_TESTING_BLACKBOX.md` | User journey validation |

---

## Test Coverage

### Expected Coverage Targets

| Module | Target | Description |
|--------|--------|-------------|
| Models | 90%+ | Schema validations, methods |
| Controllers | 85%+ | Business logic, error handling |
| Middleware | 95%+ | Auth, validation, rate limit |
| Routes | 80%+ | Endpoint definitions |

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage report saved to: `/server/coverage/lcov-report/index.html`

---

## API Testing with cURL

### Quick Test Commands

```bash
# 1. Login and save cookies
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@thinkify.com","password":"demo123"}' \
  -c cookies.txt -v

# 2. Get current user
curl http://localhost:5000/api/auth/me \
  -b cookies.txt

# 3. Get all posts
curl http://localhost:5000/api/posts

# 4. Get single post
curl http://localhost:5000/api/posts/POST_ID_HERE

# 5. Create post (authenticated)
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Test Post Title",
    "content": "This is test content with at least 20 characters.",
    "category": "CATEGORY_ID_HERE"
  }'

# 6. Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

---

## Troubleshooting

### Tests Failing to Connect

**Error:** `MongoServerSelectionError`

**Solution:** Tests use MongoDB Memory Server, no local MongoDB needed for automated tests.

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Tests Timing Out

**Error:** `Timeout - Async callback was not invoked`

**Solution:** Increase timeout in jest.config.js:
```javascript
testTimeout: 60000  // 60 seconds
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Seed Data Not Loading

**Error:** `Connection refused` during seed

**Solution:** Ensure MongoDB is running:
```bash
brew services start mongodb-community
# or
mongod --dbpath /data/db
```

### Cookie Not Being Set

**Issue:** Auth tests fail with 401

**Solution:** Ensure cookie-parser middleware is loaded:
```javascript
app.use(cookieParser());
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd server
        npm ci
    
    - name: Run tests
      run: |
        cd server
        npm test
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        directory: ./server/coverage
```

---

## Test Summary Checklist

Before release, ensure:

- [ ] All automated tests pass (`npm test`)
- [ ] Coverage meets targets (`npm run test:coverage`)
- [ ] White box tests completed (documented)
- [ ] Black box tests completed (documented)
- [ ] No critical bugs open
- [ ] Test results documented

---

## Questions?

- Check existing test files for examples
- Review Jest documentation: https://jestjs.io/docs
- Supertest docs: https://github.com/ladjs/supertest
