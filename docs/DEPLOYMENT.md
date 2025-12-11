# Deployment Guide

Comprehensive guide to deploying Thinkify across multiple platforms.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel (Recommended for Frontend)](#vercel)
3. [Railway (Full-Stack)](#railway)
4. [Heroku](#heroku)
5. [AWS](#aws)
6. [Docker Deployment](#docker)
7. [Database Migration](#database-migration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Scaling Strategies](#scaling-strategies)

## Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Tests passing
- [ ] Security audit clean
- [ ] Build artifacts generated
- [ ] Secrets securely stored
- [ ] Monitoring tools configured
- [ ] Backup strategy in place
- [ ] SSL/TLS certificates ready
- [ ] CDN configured (if applicable)

## Vercel (Recommended for Frontend)

Vercel is the optimal choice for deploying the React/Vite frontend.

### Setup Steps:

1. **Connect Repository:**
```bash
# Login to Vercel
npm i -g vercel
vercel login

# Deploy from project root
vercel --prod
```

2. **Vercel Configuration (`vercel.json`):**
```json
{
  "buildCommand": "npm run build --prefix client",
  "outputDirectory": "client/dist",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.example.com/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "@api_url"
  },
  "domains": ["thinkify.com", "www.thinkify.com"]
}
```

3. **Environment Variables in Vercel:**
Go to Project Settings → Environment Variables:
```
VITE_API_URL=https://api.example.com
VITE_APP_NAME=Thinkify
```

4. **Custom Domain:**
- Settings → Domains
- Add custom domain
- Configure DNS records

5. **GitHub Integration:**
- Connect GitHub repository
- Enable automatic deployments on push
- Configure production branch (main)

### Benefits:
- Zero-config deployments
- Edge functions for serverless API routes
- Built-in image optimization
- Global CDN
- SSL/TLS automatic

---

## Railway (Full-Stack Recommended)

Railway is excellent for deploying both frontend and backend as microservices.

### Setup Steps:

1. **Connect GitHub:**
   - Visit [railway.app](https://railway.app)
   - Click "Create New Project"
   - Select "Deploy from GitHub repo"

2. **Server Deployment:**

Create `Dockerfile` in server directory:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
```

Create `railway.json`:
```json
{
  "build": {
    "builder": "dockerfile",
    "dockerfile": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node src/index.js",
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 5
  }
}
```

3. **Database Integration:**
   - Add PostgreSQL plugin
   - Configure `DATABASE_URL` environment variable
   - Run migrations

4. **Client Deployment:**

Create `railway.json` in client:
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm run preview"
  }
}
```

5. **Environment Variables:**
```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<your-secret>
VITE_API_URL=https://api.example.com
```

6. **Deploy:**
```bash
# Install Railway CLI
brew install railway

# Login
railway login

# Deploy
railway up
```

### Advantages:
- Simple GitHub integration
- PostgreSQL plugin included
- Automatic HTTPS
- Easy scaling
- Affordable pricing

---

## Heroku

Heroku is a traditional PaaS platform with extensive features.

### Server Deployment:

1. **Prepare App:**
```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create thinkify-api
```

2. **Procfile (in server root):**
```
web: node src/index.js
worker: node src/worker.js
release: npm run migrate
```

3. **Configure Environment Variables:**
```bash
heroku config:set DATABASE_URL=postgresql://...
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
```

4. **Database Setup:**
```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Run migrations
heroku run npm run migrate
```

5. **Deploy:**
```bash
git push heroku main
```

### Client on Heroku:

Create `server.js` for static file serving:
```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(process.env.PORT || 3000);
```

Update Procfile:
```
web: node server.js
```

### Advantages:
- Easy database provisioning
- Add-ons marketplace
- Review apps for PRs
- Built-in CI/CD

---

## AWS Deployment

AWS offers scalable infrastructure with more control.

### Option 1: EC2 + RDS

```bash
# Launch EC2 instance (Ubuntu 22.04)
# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql-client

# Clone repository
git clone <your-repo>
cd thinkify

# Install dependencies
npm install
npm install --prefix server
npm install --prefix client

# Build client
npm run build --prefix client

# Configure environment
sudo nano /etc/environment
# Add: DATABASE_URL, JWT_SECRET, NODE_ENV, etc.

# Start server with PM2
npm install -g pm2
pm2 start server/src/index.js --name thinkify-api

# Enable reverse proxy with Nginx
sudo apt install nginx
sudo systemctl start nginx
```

Nginx configuration (`/etc/nginx/sites-available/thinkify`):
```nginx
server {
    listen 80;
    server_name api.example.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: ECS + Fargate

```dockerfile
# server/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
```

Push to ECR:
```bash
# Authenticate
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t thinkify-api:latest server/
docker tag thinkify-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/thinkify-api:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/thinkify-api:latest
```

### Option 3: Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-20 thinkify

# Deploy
eb create thinkify-env
eb deploy
```

### Advantages:
- Highly scalable
- Complete control
- Enterprise features
- Cost-effective at scale

---

## Docker Deployment

Self-hosted Docker deployment for maximum control.

### Docker Compose Setup:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: thinkify
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: thinkify
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  server:
    build: ./server
    environment:
      DATABASE_URL: postgresql://thinkify:${DB_PASSWORD}@postgres:5432/thinkify
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    restart: unless-stopped

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: http://server:5000
    ports:
      - "3000:80"
    depends_on:
      - server
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - server
      - client
    restart: unless-stopped

volumes:
  postgres_data:
```

Client Dockerfile:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Deploy:
```bash
# Build images
docker-compose build

# Run services
docker-compose up -d

# Run migrations
docker-compose exec server npm run migrate

# View logs
docker-compose logs -f
```

---

## Database Migration

### Pre-deployment:

```bash
# Create migration
npm run migrate:create -- --name migration_name

# Review migrations
npm run migrate:list

# Test locally
npm run migrate:dev

# Dry-run in production-like environment
NODE_ENV=staging npm run migrate:dry-run
```

### During Deployment:

Add to deployment script:
```bash
#!/bin/bash
npm run migrate
if [ $? -eq 0 ]; then
  echo "Migration successful, proceeding with deployment..."
  npm run deploy
else
  echo "Migration failed, aborting deployment"
  exit 1
fi
```

### Rollback:

```bash
# Rollback last migration
npm run migrate:rollback

# Rollback all
npm run migrate:rollback:all
```

---

## Monitoring & Logging

### Configure Logging:

1. **Sentry (Error Tracking):**
```javascript
// server/src/index.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

2. **Winston (Logging):**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

module.exports = logger;
```

3. **Datadog / New Relic:**
```bash
# Datadog
npm install dd-trace --save

# New Relic
npm install newrelic --save
```

### Health Checks:

```javascript
// server/src/routes/health.routes.js
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});
```

---

## Scaling Strategies

### Horizontal Scaling:

1. **Load Balancing:**
   - Use HAProxy or Nginx load balancer
   - Configure multiple server instances
   - Use sticky sessions for WebSockets

2. **Database Optimization:**
   - Enable read replicas
   - Implement connection pooling (pgBouncer)
   - Add caching layer (Redis)

3. **Caching Strategy:**
```javascript
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Cache middleware
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    
    client.get(key, (err, data) => {
      if (data) {
        res.json(JSON.parse(data));
      } else {
        res.sendResponse = res.json;
        res.json = (body) => {
          client.setex(key, duration, JSON.stringify(body));
          res.sendResponse(body);
        };
        next();
      }
    });
  };
};
```

### Vertical Scaling:

- Upgrade server resources (CPU, RAM)
- Optimize code and database queries
- Use CDN for static assets

### Container Orchestration:

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: thinkify-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: thinkify-api
  template:
    metadata:
      labels:
        app: thinkify-api
    spec:
      containers:
      - name: api
        image: thinkify-api:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: thinkify-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
```

---

## Summary Table

| Platform | Best For | Difficulty | Cost | Performance |
|----------|----------|------------|------|-------------|
| Vercel | Frontend only | ⭐ | Low | Excellent |
| Railway | Full-stack | ⭐⭐ | Low-Medium | Very Good |
| Heroku | Full-stack | ⭐⭐ | Medium | Good |
| AWS | Enterprise | ⭐⭐⭐⭐ | Medium-High | Excellent |
| Docker (Self-hosted) | Full control | ⭐⭐⭐ | Custom | Depends |

---

## Post-Deployment

1. **Monitor performance:**
   - Set up uptime monitoring (Uptime Robot)
   - Monitor error rates
   - Track response times

2. **Backup strategy:**
   - Daily database backups
   - Automated backup verification
   - Test restore procedures

3. **Security:**
   - Enable HTTP security headers
   - Implement rate limiting
   - Regular security audits

4. **Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Plan update windows
