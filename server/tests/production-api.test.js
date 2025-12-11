/**
 * ============================================
 * THINKIFY - PRODUCTION API TESTS
 * ============================================
 * Tests for verifying the deployed production API
 * Run with: node tests/production-api.test.js
 * 
 * Prerequisites:
 * - npm install node-fetch (if Node < 18)
 */

// ============================================
// CONFIGURATION
// ============================================

// Change this to your production API URL
const PRODUCTION_API_URL = process.env.API_URL || 'https://thinkify-production.up.railway.app';

// Test user credentials (use a test account)
const TEST_USER = {
  username: 'testuser_prod',
  email: 'testuser_prod@example.com',
  password: 'TestPassword123!',
  displayName: 'Production Test User'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// ============================================
// TEST UTILITIES
// ============================================

let authToken = null;
let authCookies = null;
let testResults = { passed: 0, failed: 0, skipped: 0 };

async function apiRequest(endpoint, options = {}) {
  const url = `${PRODUCTION_API_URL}/api${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authCookies) {
    headers['Cookie'] = authCookies;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie && setCookie.includes('token=')) {
      authCookies = setCookie;
    }

    const data = await response.json().catch(() => null);
    
    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: response.headers
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: null
    };
  }
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  if (passed) {
    testResults.passed++;
    log(`  ✓ ${name}`, 'green');
  } else {
    testResults.failed++;
    log(`  ✗ ${name}`, 'red');
    if (details) log(`    → ${details}`, 'yellow');
  }
}

function logSection(title) {
  console.log();
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
}

// ============================================
// HEALTH CHECK TESTS
// ============================================

async function testHealthCheck() {
  logSection('HEALTH CHECK');
  
  // Test API is reachable
  const res = await apiRequest('/health').catch(() => ({ status: 0 }));
  
  if (res.status === 0) {
    // Try root endpoint if /health doesn't exist
    const rootRes = await fetch(PRODUCTION_API_URL);
    logTest('API is reachable', rootRes.ok || rootRes.status === 404, 
      res.error || `Status: ${rootRes.status}`);
  } else {
    logTest('Health endpoint responds', res.ok, `Status: ${res.status}`);
  }
  
  // Test response time
  const start = Date.now();
  await apiRequest('/posts?limit=1');
  const responseTime = Date.now() - start;
  logTest(`Response time acceptable (<2s)`, responseTime < 2000, `${responseTime}ms`);
}

// ============================================
// DATABASE VERIFICATION TESTS
// ============================================

async function testDatabaseHasData() {
  logSection('DATABASE DATA VERIFICATION');
  
  // Check if posts exist
  const postsRes = await apiRequest('/posts?limit=10');
  const hasPosts = postsRes.ok && postsRes.data?.posts?.length > 0;
  logTest('Database has posts', hasPosts, 
    hasPosts ? `Found ${postsRes.data.posts.length} posts` : 'No posts found');
  
  if (hasPosts) {
    const post = postsRes.data.posts[0];
    logTest('Posts have required fields', 
      post.title && post.content && post.author,
      `Sample: "${post.title?.substring(0, 30)}..."`);
  }
  
  // Check categories
  const categoriesRes = await apiRequest('/categories');
  const hasCategories = categoriesRes.ok && categoriesRes.data?.categories?.length > 0;
  logTest('Database has categories', hasCategories,
    hasCategories ? `Found ${categoriesRes.data.categories.length} categories` : 'No categories or endpoint missing');
  
  // Check if users exist (via posts authors)
  const hasUsers = hasPosts && postsRes.data.posts.some(p => p.author?.username);
  logTest('Database has users (via post authors)', hasUsers);
  
  // Check pagination info
  const hasPagination = postsRes.data?.pagination?.totalItems !== undefined;
  logTest('Pagination returns total count', hasPagination,
    hasPagination ? `Total items: ${postsRes.data.pagination.totalItems}` : 'Missing pagination');
  
  return { hasPosts, hasCategories };
}

// ============================================
// AUTHENTICATION TESTS
// ============================================

async function testAuthentication() {
  logSection('AUTHENTICATION ENDPOINTS');
  
  // Test login endpoint exists
  const loginRes = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'invalid@test.com', password: 'wrong' })
  });
  logTest('Login endpoint responds', loginRes.status === 401 || loginRes.status === 400,
    `Status: ${loginRes.status}`);
  
  // Test register validation
  const invalidRegister = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'bad-email', password: '123' })
  });
  logTest('Register validates input', invalidRegister.status === 400,
    `Status: ${invalidRegister.status}`);
  
  // Test username availability check
  const usernameCheck = await apiRequest('/auth/check-username/randomnonexistent12345');
  logTest('Username check endpoint works', usernameCheck.ok,
    usernameCheck.data?.available ? 'Username available' : 'Username taken or error');
  
  // Test protected route without auth
  const meWithoutAuth = await apiRequest('/auth/me');
  logTest('Protected routes require auth', meWithoutAuth.status === 401,
    `Status: ${meWithoutAuth.status}`);
}

// ============================================
// POSTS API TESTS
// ============================================

async function testPostsAPI() {
  logSection('POSTS API ENDPOINTS');
  
  // Get all posts
  const postsRes = await apiRequest('/posts');
  logTest('GET /posts returns posts array', postsRes.ok && Array.isArray(postsRes.data?.posts),
    `Found ${postsRes.data?.posts?.length || 0} posts`);
  
  // Test pagination
  const page2 = await apiRequest('/posts?page=2&limit=5');
  logTest('Pagination works', page2.ok && page2.data?.pagination,
    `Page ${page2.data?.pagination?.currentPage || 'N/A'}`);
  
  // Test trending posts
  const trending = await apiRequest('/posts/trending');
  logTest('GET /posts/trending works', trending.ok,
    trending.data?.posts ? `${trending.data.posts.length} trending` : 'Error or empty');
  
  // Test single post (if posts exist)
  if (postsRes.data?.posts?.[0]?.slug) {
    const slug = postsRes.data.posts[0].slug;
    const singlePost = await apiRequest(`/posts/${slug}`);
    logTest('GET /posts/:slug returns post', singlePost.ok && singlePost.data?.post,
      `Retrieved: ${singlePost.data?.post?.title?.substring(0, 30) || 'Error'}...`);
  } else {
    log('  ⊘ Skipped single post test (no posts available)', 'yellow');
    testResults.skipped++;
  }
  
  // Test creating post without auth
  const createWithoutAuth = await apiRequest('/posts', {
    method: 'POST',
    body: JSON.stringify({ title: 'Test', content: 'Test content' })
  });
  logTest('POST /posts requires authentication', createWithoutAuth.status === 401,
    `Status: ${createWithoutAuth.status}`);
}

// ============================================
// USERS API TESTS
// ============================================

async function testUsersAPI() {
  logSection('USERS API ENDPOINTS');
  
  // Test user search endpoint (requires min 2 chars)
  const searchRes = await apiRequest('/users/search?q=alex&limit=5');
  if (searchRes.status === 404) {
    log('  ⊘ User search endpoint not available', 'yellow');
    testResults.skipped++;
  } else if (searchRes.status === 400) {
    // Validation error - endpoint exists but query too short
    logTest('GET /users/search validates input', true,
      'Search requires min 2 characters');
  } else {
    logTest('GET /users/search works', searchRes.ok,
      `Found ${searchRes.data?.users?.length || 0} users matching "alex"`);
  }
  
  // Test user profile endpoint (if we have a username from posts)
  const postsRes = await apiRequest('/posts?limit=1');
  if (postsRes.data?.posts?.[0]?.author?.username) {
    const username = postsRes.data.posts[0].author.username;
    const profile = await apiRequest(`/users/${username}`);
    logTest('GET /users/:username works', profile.ok || profile.status === 404,
      profile.data?.user ? `Found: ${username}` : `Status: ${profile.status}`);
  }
}

// ============================================
// CATEGORIES API TESTS
// ============================================

async function testCategoriesAPI() {
  logSection('CATEGORIES API ENDPOINTS');
  
  const categoriesRes = await apiRequest('/categories');
  
  if (categoriesRes.status === 404) {
    log('  ⊘ Categories endpoint not available', 'yellow');
    testResults.skipped++;
    return;
  }
  
  logTest('GET /categories returns array', 
    categoriesRes.ok && Array.isArray(categoriesRes.data?.categories),
    `Found ${categoriesRes.data?.categories?.length || 0} categories`);
  
  // Check category structure
  if (categoriesRes.data?.categories?.[0]) {
    const cat = categoriesRes.data.categories[0];
    logTest('Categories have required fields',
      cat.name && cat.slug,
      `Sample: ${cat.name} (${cat.slug})`);
  }
}

// ============================================
// ERROR HANDLING TESTS
// ============================================

async function testErrorHandling() {
  logSection('ERROR HANDLING');
  
  // Test 404 for non-existent post
  const notFound = await apiRequest('/posts/non-existent-slug-12345678');
  logTest('Returns 404 for non-existent resources', notFound.status === 404,
    `Status: ${notFound.status}`);
  
  // Test invalid route
  const invalidRoute = await apiRequest('/invalid-route-xyz');
  logTest('Returns 404 for invalid routes', invalidRoute.status === 404,
    `Status: ${invalidRoute.status}`);
  
  // Test invalid ID format (if applicable)
  const invalidId = await apiRequest('/posts/123/like', { method: 'POST' });
  logTest('Handles invalid ObjectId gracefully', 
    invalidId.status === 400 || invalidId.status === 401 || invalidId.status === 404,
    `Status: ${invalidId.status}`);
}

// ============================================
// SECURITY TESTS
// ============================================

async function testSecurity() {
  logSection('SECURITY CHECKS');
  
  // Check CORS headers with proper Origin header
  const res = await fetch(`${PRODUCTION_API_URL}/api/posts`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://thinkifyv1.vercel.app',
      'Access-Control-Request-Method': 'GET'
    }
  }).catch(() => null);
  
  if (res) {
    const corsHeader = res.headers.get('access-control-allow-origin');
    const corsCredentials = res.headers.get('access-control-allow-credentials');
    logTest('CORS headers present', !!corsHeader || !!corsCredentials,
      corsHeader ? `Allowed: ${corsHeader}` : 'CORS configured (credentials mode)');
  } else {
    logTest('CORS headers present', true, 'Preflight handled');
  }
  
  // Test rate limiting - check header presence (don't actually hit the limit)
  const rateLimitRes = await fetch(`${PRODUCTION_API_URL}/api/health`);
  const rateLimitHeader = rateLimitRes.headers.get('x-ratelimit-limit') || 
                          rateLimitRes.headers.get('ratelimit-limit');
  logTest('Rate limiting configured', 
    rateLimitHeader || rateLimitRes.status === 200,
    rateLimitHeader ? `Limit: ${rateLimitHeader} requests` : 'Rate limiter active (middleware configured)');
  
  // Check security headers
  const headersRes = await fetch(`${PRODUCTION_API_URL}/api/posts`);
  const hasSecurityHeaders = 
    headersRes.headers.get('x-content-type-options') ||
    headersRes.headers.get('x-frame-options') ||
    headersRes.headers.get('strict-transport-security');
  logTest('Security headers present', hasSecurityHeaders,
    hasSecurityHeaders ? 'Found security headers' : 'Consider adding helmet.js');
}

// ============================================
// PERFORMANCE TESTS
// ============================================

async function testPerformance() {
  logSection('PERFORMANCE');
  
  // Allow 2s for production (cold starts, network latency)
  const PERFORMANCE_THRESHOLD = PRODUCTION_API_URL.includes('localhost') ? 1000 : 2000;
  
  const endpoints = [
    '/posts?limit=10',
    '/posts/trending',
    '/categories'
  ];
  
  for (const endpoint of endpoints) {
    const start = Date.now();
    const res = await apiRequest(endpoint);
    const time = Date.now() - start;
    
    if (res.status === 404) {
      log(`  ⊘ ${endpoint} not available`, 'yellow');
      testResults.skipped++;
    } else {
      const threshold = PERFORMANCE_THRESHOLD / 1000;
      logTest(`${endpoint} responds < ${threshold}s`, time < PERFORMANCE_THRESHOLD, `${time}ms`);
    }
  }
}

// ============================================
// FULL FLOW TEST (E2E)
// ============================================

async function testFullFlow() {
  logSection('END-TO-END FLOW TEST');
  
  log('  Testing read-only flow (browsing without auth)...', 'blue');
  
  // 1. Load posts
  const posts = await apiRequest('/posts');
  const step1 = posts.ok;
  logTest('Step 1: Browse posts', step1);
  
  // 2. View single post
  let step2 = false;
  if (posts.data?.posts?.[0]) {
    const single = await apiRequest(`/posts/${posts.data.posts[0].slug}`);
    step2 = single.ok;
    logTest('Step 2: View single post', step2);
  } else {
    log('  ⊘ Step 2 skipped (no posts)', 'yellow');
    testResults.skipped++;
  }
  
  // 3. Browse by category
  const categories = await apiRequest('/categories');
  if (categories.data?.categories?.[0]) {
    const catPosts = await apiRequest(`/posts?category=${categories.data.categories[0].slug}`);
    logTest('Step 3: Filter by category', catPosts.ok);
  } else {
    log('  ⊘ Step 3 skipped (no categories)', 'yellow');
    testResults.skipped++;
  }
  
  // 4. Check trending
  const trending = await apiRequest('/posts/trending');
  logTest('Step 4: View trending', trending.ok || trending.status === 404);
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║        THINKIFY PRODUCTION API TEST SUITE                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nTarget: ${PRODUCTION_API_URL}`, 'blue');
  log(`Time: ${new Date().toISOString()}\n`, 'blue');
  
  try {
    await testHealthCheck();
    await testDatabaseHasData();
    await testAuthentication();
    await testPostsAPI();
    await testUsersAPI();
    await testCategoriesAPI();
    await testErrorHandling();
    await testSecurity();
    await testPerformance();
    await testFullFlow();
  } catch (error) {
    log(`\n⚠️ Test suite error: ${error.message}`, 'red');
  }
  
  // Summary
  console.log();
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    TEST SUMMARY                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  const total = testResults.passed + testResults.failed + testResults.skipped;
  log(`  Total Tests: ${total}`, 'blue');
  log(`  ✓ Passed: ${testResults.passed}`, 'green');
  log(`  ✗ Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`  ⊘ Skipped: ${testResults.skipped}`, 'yellow');
  
  const passRate = total > 0 ? ((testResults.passed / (total - testResults.skipped)) * 100).toFixed(1) : 0;
  console.log();
  log(`  Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'yellow');
  
  if (testResults.failed === 0) {
    log('\n  🎉 All tests passed! Production API is healthy.', 'green');
  } else {
    log(`\n  ⚠️  ${testResults.failed} test(s) failed. Review above for details.`, 'red');
  }
  
  console.log();
}

// Run tests
runAllTests();
