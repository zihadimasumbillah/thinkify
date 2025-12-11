# Quick Reference Guide

Quick lookup for common commands and configurations.

## Commands Reference

### Setup & Installation
```bash
npm install                    # Install all dependencies
npm install --prefix client    # Install client deps only
npm install --prefix server    # Install server deps only
npm ci                        # Clean install (for CI/CD)
```

### Development
```bash
npm run dev                   # Start both dev servers
npm run dev:client            # Start client dev server (port 5173)
npm run dev:server            # Start server dev server (port 5000)
npm run dev:client:build      # Build client in watch mode
```

### Testing
```bash
npm test                      # Run all tests
npm test:client               # Run client tests only
npm test:server               # Run server tests only
npm run test:watch            # Run tests in watch mode
npm run test:coverage         # Generate coverage report
```

### Code Quality
```bash
npm run lint                  # Run linter
npm run lint:fix              # Fix lint errors
npm run format                # Format code with Prettier
npm run format:check          # Check formatting
npm run type-check            # TypeScript type checking (if applicable)
```

### Building
```bash
npm run build                 # Build client and server
npm run build:client          # Build client only
npm run build:server          # Build server only
npm run preview               # Preview production build
```

### Database
```bash
npm run db:setup              # Create database and seed data
npm run db:reset              # Reset database
npm run db:seed               # Seed sample data
npm run db:migrate            # Run database migrations
npm run db:migrate:create      # Create new migration
```

### Git
```bash
git checkout -b feature/name   # Create feature branch
git add .                      # Stage all changes
git commit -m "message"        # Commit changes
git push origin branch-name    # Push to remote
git pull origin main           # Update from main
git rebase main                # Rebase onto main
```

### Docker
```bash
docker-compose build           # Build images
docker-compose up              # Start containers
docker-compose down            # Stop containers
docker-compose logs -f         # View logs
docker-compose exec server sh  # Access container shell
```

---

## File Locations

### Configuration Files
| File | Purpose | Location |
|------|---------|----------|
| package.json | Root dependencies | `/package.json` |
| vite.config.js | Client build config | `/client/vite.config.js` |
| tailwind.config.js | Tailwind config | `/client/tailwind.config.js` |
| jest.config.js | Test config | `/server/jest.config.js` |
| .env | Environment vars | `/.env` |
| .env.example | Env template | `/.env.example` |
| .gitignore | Git ignore rules | `/.gitignore` |

### Source Directories
| Path | Purpose |
|------|---------|
| `client/src/` | Frontend React app |
| `client/src/components/` | Reusable components |
| `client/src/pages/` | Page components |
| `client/src/hooks/` | Custom React hooks |
| `client/src/services/` | API client |
| `client/src/stores/` | State management (Zustand) |
| `server/src/` | Backend Node.js app |
| `server/src/controllers/` | Route handlers |
| `server/src/models/` | Database models |
| `server/src/routes/` | API routes |
| `server/src/middleware/` | Express middleware |
| `server/src/utils/` | Utility functions |

### Test Files
| Path | Purpose |
|------|---------|
| `server/__tests__/` | Server unit tests |
| `server/tests/` | Server test docs |
| `client/src/**/*.test.jsx` | Client tests |

### Documentation
| File | Purpose |
|------|---------|
| `docs/SETUP.md` | This complete setup guide |
| `docs/DEPLOYMENT.md` | Deployment instructions |
| `docs/GIT_CONFIGURATION.md` | Git setup & security |
| `server/tests/TESTING_GUIDE.md` | Testing strategies |
| `server/tests/MANUAL_TESTING_BLACKBOX.md` | Manual testing checklist |
| `README.md` | Project overview |

### CI/CD Files
| File | Purpose |
|------|---------|
| `.github/workflows/test-lint.yml` | Test & lint workflow |
| `.github/workflows/code-quality.yml` | Code quality checks |
| `.github/workflows/deploy.yml` | Deployment workflow |

---

## Environment Variables

### Server (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/thinkify
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
VITE_API_URL=http://localhost:5000
```

### Client (.env.local)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Thinkify
```

---

## Port Mappings

| Service | Port | URL |
|---------|------|-----|
| Client (Vite) | 5173 | http://localhost:5173 |
| Server (Express) | 5000 | http://localhost:5000 |
| Database (PostgreSQL) | 5432 | localhost:5432 |
| Redis (if used) | 6379 | localhost:6379 |

---

## API Endpoints (Common)

### Authentication
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login user
POST   /api/auth/logout         # Logout user
GET    /api/auth/me             # Get current user
POST   /api/auth/refresh        # Refresh JWT token
```

### Posts
```
GET    /api/posts               # List all posts
POST   /api/posts               # Create post
GET    /api/posts/:id           # Get post by ID
PUT    /api/posts/:id           # Update post
DELETE /api/posts/:id           # Delete post
```

### Users
```
GET    /api/users/:id           # Get user profile
PUT    /api/users/:id           # Update profile
GET    /api/users/:id/posts     # Get user's posts
```

### Comments
```
POST   /api/posts/:id/comments  # Add comment
DELETE /api/comments/:id        # Delete comment
```

---

## Troubleshooting Quick Fixes

### Port in Use
```bash
# Find and kill process
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Database Issues
```bash
# Reset database
npm run db:reset

# Seed data
npm run db:seed
```

### npm Issues
```bash
# Clean cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Git Issues
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- .

# Fetch latest
git fetch origin
```

---

## Performance Tips

### Development
- Use Chrome DevTools for frontend debugging
- Use VS Code Debugger for backend
- Enable hot module replacement (HMR)
- Use React DevTools extension

### Production
- Enable gzip compression
- Use CDN for static assets
- Optimize images
- Implement caching
- Monitor performance with tools

---

## Security Reminders

- ❌ Never commit `.env` files
- ❌ Never hardcode secrets
- ❌ Never push to wrong branch
- ✅ Always use `.env.example` template
- ✅ Always review before pushing
- ✅ Always use feature branches
- ✅ Always write secure code

---

## Useful Extensions

### VS Code
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (API testing)
- PostgreSQL
- Docker
- Git Graph

### Browser
- React DevTools
- Redux DevTools
- Network tab (Chrome DevTools)
- Console (for debugging)

---

## Links & Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Vite Docs](https://vitejs.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## Version Info

- Node.js: 18.0.0+
- npm: 8.0.0+
- PostgreSQL: 14+
- React: 18+
- Express: 4.x
- Vite: 5.x

---

**Keep this guide handy for quick reference during development!**
