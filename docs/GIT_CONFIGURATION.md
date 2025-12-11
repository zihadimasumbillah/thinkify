# Git Configuration Guide

## Secure Git Setup for Thinkify

This guide helps you configure Git securely for the Thinkify project, protecting sensitive data and following best practices.

## 1. .gitignore Configuration

The `.gitignore` file prevents accidentally committing sensitive information. Place it in the root directory:

```
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/
.nyc_output/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
*.db
*.sqlite
*.sqlite3

# OS
Thumbs.db
.AppleDouble
.LSOverride

# Optional npm cache
.npm

# Optional REPL history
.node_repl_history

# temp files
.tmp/
temp/

# IDE specific
jsconfig.json.bak
```

## 2. Environment Variables

Create `.env.example` to document required variables without exposing secrets:

### Root `.env.example`:
```
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/thinkify_dev

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Client Configuration
VITE_API_URL=http://localhost:5000

# Email Service (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Setup Instructions:

**For Development:**
```bash
# Root directory
cp .env.example .env

# Client directory
cp client/.env.example client/.env.local

# Server directory
cp server/.env.example server/.env
```

**For Production:**
- Never commit actual `.env` files
- Use platform-specific secret management (GitHub Secrets, Vercel, Railway, etc.)
- Set environment variables directly in deployment platform

## 3. Git Configuration Commands

```bash
# Configure user globally (or per repo with --local)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Enable Git credential caching (macOS)
git config --global credential.helper osxkeychain

# Configure line endings
git config --global core.autocrlf input  # macOS/Linux
git config --global core.autocrlf true   # Windows

# Set merge strategy
git config --global pull.rebase false

# View current configuration
git config --list
```

## 4. SSH Key Setup (Recommended)

SSH keys are more secure than HTTPS:

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Display public key (add to GitHub)
cat ~/.ssh/id_ed25519.pub
```

## 5. GitHub Repository Setup

### Initial Repository Creation:
```bash
# Initialize repository
git init

# Add remote
git remote add origin https://github.com/username/thinkify.git

# Initial commit
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### Branch Protection Rules:
1. Go to Repository Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews before merging (2 reviewers)
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Dismiss stale reviews

### Collaborator Access:
1. Settings → Collaborators
2. Invite team members
3. Configure teams for code review

## 6. Commit Message Guidelines

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT token refresh mechanism
fix(post): resolve comment count calculation bug
docs(setup): add deployment guide
test(auth): add login validation tests
```

## 7. Git Hooks with Husky (Optional but Recommended)

```bash
# Install husky
npm install husky --save-dev
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"

# Add pre-push hook
npx husky add .husky/pre-push "npm run test"
```

**.husky/pre-commit:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
```

**.husky/pre-push:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test
```

## 8. Sensitive Data Removal

If you accidentally commit sensitive data:

```bash
# Remove from git history (use with caution!)
git filter-branch --tree-filter 'rm -f .env' -f HEAD

# Or use BFG Repo-Cleaner (easier)
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## 9. Daily Workflow

```bash
# Update local repository
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit with descriptive messages
git add .
git commit -m "feat(feature): description"

# Push to remote
git push origin feature/your-feature

# Create Pull Request on GitHub
# After review and approval, squash and merge
```

## 10. Security Checklist

- [ ] `.env` files in `.gitignore`
- [ ] No API keys in code
- [ ] No database credentials in commits
- [ ] SSH keys configured for GitHub
- [ ] Branch protection rules enabled
- [ ] Sensitive patterns in `.gitignore`
- [ ] Commit messages follow conventions
- [ ] Code review process established
- [ ] No large binary files committed
- [ ] Regular secret scanning enabled

## Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Documentation](https://git-scm.com/doc)
