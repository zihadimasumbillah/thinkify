# 🎯 Thinkify Setup Checklist

Interactive checklist to track your setup progress. Print this or use as a digital checklist.

---

## Phase 1: Initial Setup ⚙️

### Prerequisites
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 8+ installed (`npm --version`)
- [ ] PostgreSQL 14+ installed and running
- [ ] Git installed (`git --version`)
- [ ] GitHub account created
- [ ] Code editor (VS Code recommended)

**Time estimate:** 30-60 minutes

### Repository Setup
- [ ] Repository cloned locally
- [ ] Navigated to project directory
- [ ] Running `git log` shows commit history

**Commands:**
```bash
git clone https://github.com/username/thinkify.git
cd thinkify
git log --oneline -5
```

---

## Phase 2: Dependencies & Configuration 📦

### Install Dependencies
- [ ] Root dependencies installed (`npm install`)
- [ ] Client dependencies installed (`npm install --prefix client`)
- [ ] Server dependencies installed (`npm install --prefix server`)
- [ ] No critical vulnerabilities (`npm audit`)

**Commands:**
```bash
npm install
npm install --prefix client
npm install --prefix server
npm audit
```

### Environment Configuration
- [ ] Created `.env` from `.env.example`
- [ ] Created `client/.env.local` from template
- [ ] Created `server/.env` from template
- [ ] Database URL configured
- [ ] JWT secret configured
- [ ] API URL configured

**Files to create:**
- `.env` (root)
- `client/.env.local`
- `server/.env`

**Sample values:**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/thinkify
PORT=5000
JWT_SECRET=your-secret-key
VITE_API_URL=http://localhost:5000
```

### Verify Configuration
- [ ] `.env` files are in `.gitignore`
- [ ] `.env.example` has no secrets
- [ ] Environment variables are accessible

**Verification:**
```bash
# Check .env is in .gitignore
cat .gitignore | grep ".env"
```

**Time estimate:** 15 minutes

---

## Phase 3: Database Setup 🗄️

### Database Creation
- [ ] PostgreSQL is running
- [ ] Database created
- [ ] Tables created and migrated
- [ ] Seed data loaded

**Commands:**
```bash
npm run db:setup        # Creates DB and seeds data
npm run db:reset        # If needed to restart
```

### Database Verification
- [ ] Can connect to database
- [ ] Tables exist
- [ ] Sample data visible

**Verification:**
```bash
# Test connection
npm run db:migrate      # Should run without errors
```

**Time estimate:** 10-15 minutes

---

## Phase 4: Development Environment 💻

### Start Development Servers
- [ ] Client dev server starts on port 5173
- [ ] Server dev server starts on port 5000
- [ ] Both servers accessible via browser
- [ ] No errors in console

**Terminal 1 - Frontend:**
```bash
npm run dev:client
# Should show: Local: http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
# Should show: Server running on port 5000
```

### Browser Testing
- [ ] Frontend loads at http://localhost:5173
- [ ] No 404 errors in browser console
- [ ] API requests working (check Network tab)
- [ ] Can interact with application

**Time estimate:** 10 minutes

---

## Phase 5: Code Quality ✅

### Run Tests
- [ ] All tests pass (`npm test`)
- [ ] Server tests pass
- [ ] Client tests pass (if configured)
- [ ] Coverage meets requirements

**Commands:**
```bash
npm test                # Run all tests
npm test:server         # Server tests only
npm test:client         # Client tests only
npm run test:coverage   # Coverage report
```

### Linting & Formatting
- [ ] Linting passes (`npm run lint`)
- [ ] No critical issues
- [ ] Code formatting consistent
- [ ] All files formatted

**Commands:**
```bash
npm run lint            # Check for issues
npm run lint:fix        # Auto-fix issues
npm run format          # Format with Prettier
```

### Security Audit
- [ ] npm audit passes
- [ ] No high/critical vulnerabilities
- [ ] Dependencies up to date

**Commands:**
```bash
npm audit
npm audit --audit-level=moderate
```

**Time estimate:** 15-20 minutes

---

## Phase 6: Git Configuration 🔐

### Git User Setup
- [ ] Git user name configured
- [ ] Git user email configured
- [ ] SSH key generated (optional but recommended)
- [ ] SSH key added to GitHub

**Commands:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --list
```

### GitHub Repository
- [ ] GitHub repository created
- [ ] Local repo connected to remote
- [ ] Can push to remote
- [ ] Can pull from remote

**Commands:**
```bash
git remote -v           # View remote
git push origin main    # Test push
git pull origin main    # Test pull
```

### Git Workflow Setup
- [ ] `.gitignore` file in place
- [ ] `.env` files in ignore list
- [ ] Understand branch naming
- [ ] Understand commit conventions

**Commit message format:**
```
feat(scope): short description
fix(scope): short description
docs: documentation update
test: add tests
```

**Time estimate:** 20 minutes

---

## Phase 7: GitHub Actions Setup 🔄

### Workflow Files
- [ ] `.github/workflows/test-lint.yml` exists
- [ ] `.github/workflows/code-quality.yml` exists
- [ ] `.github/workflows/deploy.yml` exists
- [ ] All files have valid YAML syntax

**Verify:**
```bash
ls -la .github/workflows/
```

### GitHub Secrets
- [ ] Repository secrets created
- [ ] Required secrets added:
  - [ ] DATABASE_URL (for tests)
  - [ ] JWT_SECRET (for tests)
- [ ] Optional secrets for deployment:
  - [ ] VERCEL_TOKEN
  - [ ] VERCEL_ORG_ID
  - [ ] VERCEL_PROJECT_ID
  - [ ] SONAR_TOKEN (optional)

**Add via:**
Settings → Secrets and variables → Actions → New repository secret

### Branch Protection
- [ ] Branch protection enabled for `main`
- [ ] Status checks required
- [ ] Code reviews required (2 minimum)
- [ ] Dismissal of stale reviews

**Configure via:**
Settings → Branches → Add rule

### Test Workflow Trigger
- [ ] Push a test commit
- [ ] Verify workflows run
- [ ] Check workflow logs
- [ ] All checks pass

**Commands:**
```bash
git checkout -b test/workflow
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger workflows"
git push origin test/workflow
# Check: github.com/username/thinkify/actions
```

**Time estimate:** 25-30 minutes

---

## Phase 8: Documentation Review 📚

### Read Key Documentation
- [ ] Read: SETUP.md (main guide)
- [ ] Read: QUICK_REFERENCE.md (commands)
- [ ] Read: GIT_CONFIGURATION.md (git setup)
- [ ] Read: GITHUB_ACTIONS_SETUP.md (CI/CD)
- [ ] Read: DEPLOYMENT.md (deployment options)

**Location:** `docs/` directory

### Documentation Verification
- [ ] Understand project structure
- [ ] Know available npm scripts
- [ ] Know where configuration files are
- [ ] Understand deployment options

**Time estimate:** 30 minutes

---

## Phase 9: Optional Enhancements 🚀

### IDE Extensions
- [ ] VS Code installed
- [ ] ES7+ React snippets extension
- [ ] Prettier extension
- [ ] ESLint extension
- [ ] Thunder Client or Postman (API testing)
- [ ] PostgreSQL extension

### Git Hooks (Optional)
- [ ] Husky installed and configured
- [ ] Pre-commit hook runs lint
- [ ] Pre-push hook runs tests
- [ ] Hooks are executable

**Commands:**
```bash
npm install husky --save-dev
npx husky install
```

### Browser Extensions
- [ ] React DevTools installed
- [ ] Redux DevTools installed (if using Redux)
- [ ] Network tab familiar

**Time estimate:** 15-20 minutes

---

## Phase 10: Pre-Deployment Verification ✨

### Final Checks
- [ ] All tests pass locally
- [ ] Linting passes
- [ ] Build succeeds
- [ ] No console errors
- [ ] Database migration works
- [ ] Git history clean
- [ ] All documentation read

**Commands:**
```bash
npm test
npm run lint
npm run build
npm run db:migrate
git log --oneline -10
```

### Workspace Analysis
- [ ] Run: `node setup-scripts/analyze-workspace.js`
- [ ] Run: `node setup-scripts/verify-project.js`
- [ ] Both scripts pass without critical issues

**Commands:**
```bash
node setup-scripts/analyze-workspace.js
node setup-scripts/verify-project.js
```

### Deployment Readiness
- [ ] Choose deployment platform (Vercel + Railway recommended)
- [ ] Read: DEPLOYMENT.md guide for chosen platform
- [ ] Setup: Platform-specific configuration
- [ ] Test: Staging deployment
- [ ] Verify: Production deployment

**Time estimate:** 30 minutes

---

## Estimated Total Setup Time

| Phase | Time | Total |
|-------|------|-------|
| 1. Initial Setup | 30-60 min | 30-60 |
| 2. Dependencies | 15 min | 45-75 |
| 3. Database | 10-15 min | 55-90 |
| 4. Dev Environment | 10 min | 65-100 |
| 5. Code Quality | 15-20 min | 80-120 |
| 6. Git Config | 20 min | 100-140 |
| 7. GitHub Actions | 25-30 min | 125-170 |
| 8. Documentation | 30 min | 155-200 |
| 9. Optional | 15-20 min | 170-220 |
| 10. Verification | 30 min | 200-250 |

**Total: 3-4 hours for complete setup**

---

## Quick Status Summary

### ✅ Completed
- [ ] Phase 1 - Initial Setup
- [ ] Phase 2 - Dependencies & Config
- [ ] Phase 3 - Database
- [ ] Phase 4 - Dev Environment
- [ ] Phase 5 - Code Quality
- [ ] Phase 6 - Git Configuration
- [ ] Phase 7 - GitHub Actions
- [ ] Phase 8 - Documentation
- [ ] Phase 9 - Enhancements
- [ ] Phase 10 - Pre-Deployment

### 📍 Current Phase
**Phase: _____ / 10**

### ⏱️ Time Elapsed
**Start time:** ________
**Current time:** ________
**Elapsed:** ________

---

## Troubleshooting During Setup

### Common Issues

**npm install fails:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Port already in use:**
```bash
lsof -i :5000        # Find process
kill -9 <PID>        # Kill process
```

**Database connection error:**
```bash
npm run db:reset
npm run db:setup
```

**Tests failing:**
```bash
npm test -- --verbose
npm test -- --no-coverage
```

**See:** [QUICK_REFERENCE.md - Troubleshooting](./QUICK_REFERENCE.md#troubleshooting-quick-fixes)

---

## Success Criteria

You're ready to start development when:

✅ All phases completed
✅ All scripts run without errors
✅ Local dev servers working
✅ Tests passing
✅ Git configured
✅ GitHub Actions working
✅ You understand the project structure

---

## Next Actions

After completing this checklist:

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/first-feature
   ```

2. **Make a small change:**
   - Edit a file
   - Run tests
   - Commit changes

3. **Create a pull request:**
   - Push to remote
   - Go to GitHub
   - Click "Create Pull Request"

4. **Deploy when ready:**
   - Follow DEPLOYMENT.md
   - Choose your platform
   - Deploy to staging first

---

## Support & Help

If stuck on any phase:

1. Check the relevant guide in `docs/`
2. Check QUICK_REFERENCE.md troubleshooting
3. Search GitHub Issues
4. Create a new GitHub Issue with:
   - Which phase you're on
   - Error message/screenshot
   - What you've tried
   - Your environment (OS, Node version)

---

## Document Information

- **Version:** 1.0.0
- **Last Updated:** December 2025
- **Maintained By:** Development Team
- **Audience:** All team members

---

**You've got this! 🚀 Happy coding!**

Remember: If you complete this checklist, you have a fully functional development environment!
