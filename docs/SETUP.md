# Thinkify - Complete Setup Guide

Welcome to the comprehensive setup guide for Thinkify! This document provides everything needed to develop, test, and deploy the application.

## 📋 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm 8+ or yarn/pnpm
- PostgreSQL 14+ ([Download](https://www.postgresql.org/))
- Git 2.0+ ([Download](https://git-scm.com/))
- Docker (optional, for containerized development)

### 5-Minute Setup

```bash
# 1. Clone and navigate
git clone https://github.com/your-username/thinkify.git
cd thinkify

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
cp client/.env.example client/.env.local
cp server/.env.example server/.env

# 4. Setup database (update .env with your credentials)
npm run db:setup

# 5. Start development servers
npm run dev
```

Your application is now running:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📁 Project Structure

```
thinkify/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client
│   │   └── stores/        # Zustand state management
│   └── package.json
├── server/                # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   └── package.json
├── docs/                  # Documentation
├── setup-scripts/         # Utility scripts
└── .github/workflows/     # CI/CD pipelines
```

See [detailed structure analysis](#workspace-analysis-scripts) below.

---

## 🚀 Development Guide

### Starting the Development Environment

```bash
# Terminal 1: Frontend (Vite dev server)
npm run dev:client
# Runs at: http://localhost:5173

# Terminal 2: Backend (Node.js with nodemon)
npm run dev:server
# Runs at: http://localhost:5000

# Or start both simultaneously
npm run dev
```

### Making API Requests

The API client is pre-configured in `client/src/services/api.js`:

```javascript
import { api } from '@/services/api';

// GET request
const data = await api.get('/posts');

// POST request
const response = await api.post('/posts', {
  title: 'My Post',
  content: 'Post content'
});

// With error handling
try {
  await api.post('/posts', data);
} catch (error) {
  console.error('Error:', error.response.data.message);
}
```

### Available npm Scripts

```bash
# Development
npm run dev              # Start both client and server
npm run dev:client      # Start client only
npm run dev:server      # Start server only

# Testing
npm test                # Run all tests
npm test:client         # Client tests
npm test:server         # Server tests
npm test:watch          # Watch mode

# Linting & Formatting
npm run lint            # Lint all code
npm run lint:fix        # Fix linting issues
npm run format          # Format with Prettier

# Building
npm run build           # Build both client and server
npm run build:client    # Build client only
npm run build:server    # Build server only

# Database
npm run db:setup        # Create and seed database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed sample data
npm run db:reset        # Reset database

# Production
npm run start           # Start production build
npm run preview         # Preview production build
```

---

## 🔐 Git Configuration

### Initial Setup

Follow the [Git Configuration Guide](./docs/GIT_CONFIGURATION.md) for:
- Secure environment variable setup
- SSH key configuration
- Commit message conventions
- Branch protection rules
- GitHub repository configuration

Quick summary:
```bash
# Configure Git user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Generate SSH key (recommended)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Create feature branch
git checkout -b feature/your-feature-name

# Commit with conventional messages
git commit -m "feat(scope): description"

# Push and create PR
git push origin feature/your-feature-name
```

### Environment Variables

**Never commit `.env` files!** Use `.env.example` as template:

```bash
# Copy template to local files
cp .env.example .env
cp client/.env.example client/.env.local
cp server/.env.example server/.env

# Edit with your values
nano .env
```

See [GIT_CONFIGURATION.md](./docs/GIT_CONFIGURATION.md) for detailed security practices.

---

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Client tests (with React Testing Library)
npm test:client

# Server tests (with Jest)
npm test:server

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Writing Tests

**Client (React Testing Library):**
```javascript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/common/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

**Server (Jest):**
```javascript
describe('Auth Controller', () => {
  test('should login user with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

See [TESTING_GUIDE.md](./server/tests/TESTING_GUIDE.md) for comprehensive testing strategies.

---

## 📊 Workspace Analysis Tools

Use provided scripts to understand and verify project structure:

### Analyze Workspace Structure

```bash
node setup-scripts/analyze-workspace.js

# Output:
# 🔍 Analyzing workspace structure...
# 📊 WORKSPACE ANALYSIS REPORT
# 📁 Structure Overview:
#   Total Directories: 45
#   Total Files: 203
# 📄 File Types Distribution:
#   .js: 85 files
#   .jsx: 28 files
#   ...
```

### Verify Project Integrity

```bash
node setup-scripts/verify-project.js

# Output:
# ✔️ PROJECT VERIFICATION
# ✅ Root package.json
# ✅ Client package.json
# ✅ Server package.json
# ...
# ✅ Verification passed!
```

Source files:
- [`setup-scripts/analyze-workspace.js`](./setup-scripts/analyze-workspace.js)
- [`setup-scripts/verify-project.js`](./setup-scripts/verify-project.js)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

Three automated workflows run on every push and pull request:

#### 1. Test & Lint (`test-lint.yml`)
- Runs on multiple Node.js versions (18.x, 20.x)
- Lints client and server code
- Runs server tests with PostgreSQL
- Builds client assets
- Uploads code coverage
- Performs security scanning

Triggers: Push to `main` or `develop`, all PRs

#### 2. Code Quality (`code-quality.yml`)
- SonarCloud analysis
- Dependency vulnerability checks
- Secret scanning (TruffleHog)
- CodeQL security analysis

Triggers: Push to `main` or `develop`, all PRs

#### 3. Deploy (`deploy.yml`)
- Builds Docker images for server
- Builds client for Vercel
- Deploys to staging environment
- Deploys to production (with approval)
- Sends Slack notifications

Triggers: Push to `main`, manual workflow dispatch

View configurations:
- [`.github/workflows/test-lint.yml`](./.github/workflows/test-lint.yml)
- [`.github/workflows/code-quality.yml`](./.github/workflows/code-quality.yml)
- [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)

### Setting Up CI/CD

1. **Add GitHub Secrets:**
   ```
   SONAR_TOKEN           # From sonarcloud.io
   VERCEL_TOKEN          # From vercel.com
   VERCEL_ORG_ID         # Vercel organization ID
   VERCEL_PROJECT_ID     # Vercel project ID
   PRODUCTION_API_URL    # Production API endpoint
   SLACK_WEBHOOK         # For notifications
   DEPLOY_KEY            # SSH key for deployments
   ```

2. **Enable Branch Protection:**
   - Repository Settings → Branches
   - Add rule for `main`
   - Require status checks to pass
   - Require 2 pull request reviews

---

## 🌐 Deployment

Comprehensive deployment guide for multiple platforms:

### Recommended Stack

| Component | Platform | Reason |
|-----------|----------|--------|
| Frontend | Vercel | Built for React/Vite, zero-config, global CDN |
| Backend | Railway | Simple setup, includes PostgreSQL, affordable |
| Database | PostgreSQL | Reliable, featured, open-source |

### Quick Deployment Steps

**Frontend on Vercel:**
```bash
npm i -g vercel
vercel --prod
# Configure environment: VITE_API_URL=https://api.example.com
```

**Backend on Railway:**
```bash
npm i -g @railway/cli
railway login
railway up
# Configure secrets and database connection
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions on:
- ✅ Vercel (Frontend) - Recommended
- ✅ Railway (Full-Stack) - Recommended
- ✅ Heroku (Traditional PaaS)
- ✅ AWS (Enterprise)
- ✅ Docker (Self-hosted)

---

## 🔒 Security

### Code Security

- Dependencies checked with `npm audit`
- Secret scanning via GitHub Actions
- CodeQL analysis for vulnerabilities
- Dependency updates with Dependabot

### Environment Security

- `.env` files never committed
- Secrets stored in platform-specific vaults
- SSH keys instead of HTTPS
- Database credentials encrypted
- API keys rotated regularly

### API Security

```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// CORS
const cors = require('cors');
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// Input validation
const { body, validationResult } = require('express-validator');
router.post('/posts', [
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('content').trim().isLength({ min: 1 })
], handler);
```

See [GIT_CONFIGURATION.md](./docs/GIT_CONFIGURATION.md#10-security-checklist) for security checklist.

---

## 📈 Performance Optimization

### Frontend

- Vite for fast dev server and optimized builds
- Code splitting with React Router
- Image optimization with sharp
- Lazy loading for components
- Tailwind CSS for minimal CSS
- React.memo for component optimization

### Backend

- Connection pooling for database
- Redis caching for frequently accessed data
- Query optimization and indexing
- Pagination for list endpoints
- Response compression with gzip
- Load balancing ready

### Database

- Proper indexing on foreign keys
- Query optimization
- Connection pooling
- Regular maintenance
- Backup strategy

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Reset database
npm run db:reset

# Check connection string in .env
DATABASE_URL=postgresql://user:password@localhost:5432/thinkify
```

### npm Install Fails

```bash
# Clear cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Vite Port Conflict

```bash
# Kill process on port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or configure different port in vite.config.js
export default {
  server: {
    port: 3000
  }
}
```

### Tests Failing

```bash
# Check Node version
node --version  # Should be 18+

# Update dependencies
npm update

# Run with verbose output
npm test -- --verbose

# Check test config in jest.config.js
```

---

## 📚 Additional Resources

### Documentation
- [Git Configuration Guide](./docs/GIT_CONFIGURATION.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Server Testing Guide](./server/tests/TESTING_GUIDE.md)
- [Manual Testing Checklist](./server/tests/MANUAL_TESTING_BLACKBOX.md)

### External Resources
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Express.js Documentation](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Tailwind CSS](https://tailwindcss.com)

### Community
- GitHub Issues for bug reports
- GitHub Discussions for questions
- Pull Requests welcome!

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat(scope): AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [GIT_CONFIGURATION.md](./docs/GIT_CONFIGURATION.md) for detailed contribution guidelines.

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📞 Support

- Create an issue for bug reports
- Start a discussion for questions
- Check existing issues before posting

---

## ✅ Setup Verification Checklist

Use this checklist to ensure complete setup:

- [ ] Node.js 18+ installed
- [ ] Git configured with name and email
- [ ] Repository cloned locally
- [ ] Dependencies installed (`npm install`)
- [ ] Environment files created (`.env`, `client/.env.local`, `server/.env`)
- [ ] Database created and seeded (`npm run db:setup`)
- [ ] Dev servers start successfully (`npm run dev`)
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] GitHub repository connected
- [ ] GitHub Actions workflows visible
- [ ] Environment variables documented
- [ ] SSH key configured (optional but recommended)

Run verification scripts:
```bash
node setup-scripts/analyze-workspace.js
node setup-scripts/verify-project.js
```

---

**Last Updated:** December 2025
**Maintained By:** Development Team
**Version:** 1.0.0

For the latest updates, visit the [GitHub Repository](https://github.com/your-username/thinkify).
