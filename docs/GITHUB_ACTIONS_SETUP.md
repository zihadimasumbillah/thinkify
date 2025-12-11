# GitHub Actions Setup Guide

Complete guide to configuring GitHub Actions CI/CD pipelines for Thinkify.

## Overview

The Thinkify project includes three automated GitHub Actions workflows:

1. **Test & Lint** - Runs tests and linting on every push/PR
2. **Code Quality** - Performs security scanning and dependency checks
3. **Deploy** - Builds and deploys to staging/production

## Prerequisites

Before setting up workflows, you need:

- GitHub repository created
- Vercel account (for frontend deployment)
- Railway or Heroku account (for backend)
- Optional: Sonar Cloud account (code quality)
- Optional: Slack workspace (notifications)

## Required Secrets

Add these to Repository Settings → Secrets and Variables → Actions:

### Essential Secrets

```
VERCEL_TOKEN              # From vercel.com/account/tokens
VERCEL_ORG_ID             # From Vercel project settings
VERCEL_PROJECT_ID         # From Vercel project settings
PRODUCTION_API_URL        # Your production API domain
DATABASE_URL              # Production database connection string
JWT_SECRET                # JWT secret for token signing
```

### Optional Secrets

```
SONAR_TOKEN               # From sonarcloud.io
SLACK_WEBHOOK             # For Slack notifications
DEPLOY_KEY                # SSH key for custom deployments
```

## Setting Up Secrets

### Via GitHub UI

1. Go to repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:

```
Name: VERCEL_TOKEN
Value: your_token_here
```

### Via GitHub CLI

```bash
# Install GitHub CLI
brew install gh

# Login
gh auth login

# Add secrets
gh secret set VERCEL_TOKEN --body "your_token_here"
gh secret set VERCEL_ORG_ID --body "your_org_id"
gh secret set VERCEL_PROJECT_ID --body "your_project_id"
```

## Workflow Files

Three workflows are located in `.github/workflows/`:

### 1. test-lint.yml

Runs on every push and pull request.

**What it does:**
- Tests multiple Node.js versions (18.x, 20.x)
- Lints client and server code
- Runs server tests with PostgreSQL
- Builds client
- Scans for vulnerabilities

**Trigger:**
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**Key jobs:**
- `lint`: ESLint checks
- `test-server`: Jest tests with database
- `test-client`: Build verification
- `security-scan`: npm audit and Trivy

### 2. code-quality.yml

Runs on every push and pull request for code quality checks.

**What it does:**
- SonarCloud code analysis
- Dependency vulnerability scanning
- Secret detection
- CodeQL analysis

**Requirements:**
- Sonar Cloud account (free for public repos)
- Sonar Token added to secrets

**Setup SonarCloud:**
```bash
# 1. Create account at sonarcloud.io
# 2. Create new organization
# 3. Create project for Thinkify
# 4. Copy organization key and project key
# 5. Generate token
# 6. Add SONAR_TOKEN to GitHub secrets
```

**sonar-project.properties:**
```properties
sonar.projectKey=thinkify
sonar.organization=your-org

# Paths to source code
sonar.sources=client/src,server/src
sonar.exclusions=**/node_modules/**,**/dist/**,**/build/**

# Test coverage
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### 3. deploy.yml

Runs on push to main and allows manual trigger.

**What it does:**
- Builds Docker image for server
- Builds client for Vercel
- Deploys to staging environment
- Deploys to production (with approval)
- Sends Slack notifications

**Requirements:**
- All secrets configured
- Vercel integration
- Railway/Heroku setup (optional)

**Trigger:**
```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:  # Manual trigger
```

## Detailed Setup Instructions

### Step 1: Prepare Repository

```bash
# Clone and navigate
git clone https://github.com/username/thinkify.git
cd thinkify

# Copy workflow files (already included)
# Files should be at:
# - .github/workflows/test-lint.yml
# - .github/workflows/code-quality.yml
# - .github/workflows/deploy.yml

# Commit and push
git add .github/
git commit -m "chore: add GitHub Actions workflows"
git push origin main
```

### Step 2: Add GitHub Secrets

**Minimal setup (for testing to work):**
```
DATABASE_URL              # For test environment
JWT_SECRET               # For test signing
```

**Complete setup (for full deployment):**
```
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Server
PRODUCTION_API_URL
DATABASE_URL
JWT_SECRET

# Code Quality (optional)
SONAR_TOKEN

# Notifications (optional)
SLACK_WEBHOOK
```

### Step 3: Configure Branch Protection

```
Settings → Branches → Add rule
- Branch name: main
- Require status checks to pass:
  ✅ lint (all)
  ✅ test-server
  ✅ test-client
- Require branches to be up to date
- Require code reviews: 2 approvals
- Dismiss stale reviews
```

### Step 4: Connect Vercel

1. Go to Vercel account → Settings → Integrations
2. Add GitHub integration
3. Authorize and select repository
4. Import project and configure:
   - Build command: `npm run build --prefix client`
   - Output directory: `client/dist`
   - Environment: Add `VITE_API_URL=production-url`

### Step 5: Test Workflows

```bash
# Push a change to test workflows
git checkout -b test/workflows
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger workflows"
git push origin test/workflows

# Create pull request
# Visit: github.com/username/thinkify/pull/new/test/workflows
# Workflows should run automatically
```

## Monitoring Workflows

### View Workflow Status

```bash
# GitHub CLI
gh run list
gh run view <run_id>
gh run view <run_id> --log

# Or in GitHub UI:
# Repository → Actions → Select workflow → Recent runs
```

### Check Logs

```bash
# View specific job logs
gh run view <run_id> --log --job <job_id>

# Or via UI:
# Actions → Workflow run → Select job → View logs
```

## Customizing Workflows

### Add Custom Environment Variables

In workflow file:
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      CUSTOM_VAR: value
      SENSITIVE_VAR: ${{ secrets.SECRET_NAME }}
```

### Conditional Steps

```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: npm run deploy
```

### Skip Workflow

Add to commit message:
```bash
git commit -m "chore: update docs [skip ci]"
```

### Scheduled Runs

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

## Troubleshooting

### Workflow Not Running

1. Check `.github/workflows/` directory exists
2. Check file names match workflow definitions
3. Verify syntax with:
   ```bash
   npm install -g yaml-lint
   yaml-lint .github/workflows/*.yml
   ```
4. Check branch protection settings
5. Push to correct branch (main, develop)

### Tests Failing in CI

```bash
# View logs in Actions tab
# Common issues:
# - Different Node version locally vs CI
# - Environment variables not set
# - Database connection failed
# - Dependencies not installed

# Fix:
# 1. Match Node version locally
# 2. Set all env vars
# 3. Check database connection string
# 4. Clear node_modules and reinstall
```

### Deployment Not Triggering

1. Check trigger conditions in workflow
2. Verify secrets are set correctly
3. Check branch name matches trigger
4. Verify GitHub token permissions

## Example: Adding Slack Notifications

```yaml
# In deploy.yml
jobs:
  notify:
    runs-on: ubuntu-latest
    if: always()
    needs: [deploy-production]
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Deployment Status: ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Thinkify Deployment*\nStatus: ${{ job.status }}\nBranch: ${{ github.ref }}\nCommit: ${{ github.sha }}"
                  }
                }
              ]
            }
```

## Best Practices

1. **Use Secrets for Sensitive Data**
   - Never hardcode API keys, tokens, or passwords
   - Use `${{ secrets.SECRET_NAME }}` in workflows

2. **Test Workflows Locally**
   - Use `act` tool: `npm install -g act`
   - Run: `act push` or `act pull_request`

3. **Keep Workflows Maintainable**
   - Add comments explaining complex steps
   - Use reusable actions
   - Keep jobs focused and small

4. **Monitor Workflow Runs**
   - Review failed runs immediately
   - Check logs for errors
   - Update code to fix failures

5. **Security Best Practices**
   - Use least privilege secrets
   - Rotate tokens regularly
   - Never log sensitive data
   - Use GITHUB_TOKEN for repo access

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Act (local testing)](https://github.com/nektos/act)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

## Quick Command Reference

```bash
# Check workflow syntax
gh workflow list
gh workflow view <workflow-name>

# Trigger workflow manually
gh workflow run <workflow-name>

# View recent runs
gh run list

# View specific run details
gh run view <run-id> --log

# Manage secrets
gh secret list
gh secret set SECRET_NAME
gh secret delete SECRET_NAME
```

## Next Steps

1. ✅ Copy workflow files to `.github/workflows/`
2. ✅ Add required secrets to GitHub
3. ✅ Configure branch protection rules
4. ✅ Test workflows with a test push
5. ✅ Monitor first few runs
6. ✅ Adjust as needed for your setup

**Your CI/CD pipeline is now ready!**
