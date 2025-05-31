# Frontend Project Management Scripts

## Quick Start Commands

### 1. Initial Setup
```bash
# Clone and setup the project
git clone <repository-url> connection-game-frontend
cd connection-game-frontend
npm run setup
```

### 2. Development
```bash
# Start development server
npm run dev

# Start with specific port
npm run dev -- --port 3000

# Start with host (for mobile testing)
npm run dev -- --host 0.0.0.0
```

### 3. Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- LoginForm.test.js
```

### 4. Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

### 5. Build & Deploy
```bash
# Production build
npm run build

# Preview production build
npm run preview

# Build and analyze bundle size
npm run build:analyze

# Build and start production server
npm run start:prod
```

## Advanced Management Scripts

### Create additional npm scripts by adding to package.json:

```json
{
  "scripts": {
    "dev:https": "vite --https",
    "dev:debug": "vite --debug",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "analyze": "npm run build && npx vite-bundle-analyzer",
    "clean:cache": "rm -rf node_modules/.vite && rm -rf dist",
    "clean:full": "rm -rf node_modules node_modules/.vite dist && npm install",
    "deps:check": "npm outdated",
    "deps:update": "npm update",
    "deps:audit": "npm audit",
    "deps:audit:fix": "npm audit fix",
    "commit": "git add . && git commit",
    "push:dev": "git push origin develop",
    "push:main": "git push origin main",
    "release:patch": "npm version patch && npm run push:main",
    "release:minor": "npm version minor && npm run push:main",
    "release:major": "npm version major && npm run push:main"
  }
}
```

## Daily Development Workflow

### Morning Setup
```bash
# Pull latest changes
git pull origin develop

# Install any new dependencies
npm install

# Start development
npm run dev
```

### Before Committing
```bash
# Run quality checks
npm run lint:fix
npm run format
npm run test

# Check for security vulnerabilities
npm run deps:audit

# Commit changes
npm run commit -m "feat: add new feature"
```

### Component Development
```bash
# Create new component (manual process)
mkdir src/components/common/NewComponent
touch src/components/common/NewComponent/NewComponent.jsx
touch src/components/common/NewComponent/NewComponent.test.js
touch src/components/common/NewComponent/index.js

# Test specific component
npm test -- NewComponent.test.js
```

## Environment Management

### Environment Files
```bash
# Copy example environment file
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

### Environment-specific commands
```bash
# Development
VITE_APP_ENV=development npm run dev

# Staging
VITE_APP_ENV=staging npm run build

# Production
VITE_APP_ENV=production npm run build
```

## Debugging & Troubleshooting

### Common Issues
```bash
# Clear cache and restart
npm run clean:cache
npm run dev

# Fix dependency issues
npm run clean:full

# Check for outdated packages
npm run deps:check

# Update dependencies
npm run deps:update
```

### Debug Build Issues
```bash
# Verbose build output
npm run build -- --logLevel info

# Debug mode
npm run dev:debug
```

### Mobile Testing
```bash
# Start with host binding for mobile testing
npm run dev -- --host 0.0.0.0 --port 3000

# Then access via: http://YOUR_IP:3000
```

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Check for unused dependencies
npx depcheck

# Check bundle composition
npx webpack-bundle-analyzer dist/stats.html
```

### Performance Testing
```bash
# Lighthouse CI (if configured)
npx lighthouse-ci autorun

# Performance profiling
npm run build && npm run preview
```

## Git Workflow Commands

### Feature Development
```bash
# Create new feature branch
git checkout -b feature/new-feature

# Regular commits during development
git add .
git commit -m "feat: implement card drawing logic"

# Push feature branch
git push origin feature/new-feature
```

### Code Review Process
```bash
# Before creating PR
npm run lint:fix
npm run format
npm run test
npm run build

# Create PR via GitHub CLI (if installed)
gh pr create --title "Add card drawing feature" --body "Implements card drawing with proper state management"
```

### Release Process
```bash
# Patch release (bug fixes)
npm run release:patch

# Minor release (new features)
npm run release:minor

# Major release (breaking changes)
npm run release:major
```

## Docker Commands (if needed later)

### Development with Docker
```bash
# Build development image
docker build -t connection-game-frontend:dev .

# Run development container
docker run -p 3000:3000 -v $(pwd):/app connection-game-frontend:dev

# Production build
docker build -t connection-game-frontend:prod --target production .
```

## Monitoring & Analytics

### Error Tracking
```bash
# Check for console errors
npm run dev
# Open browser dev tools and monitor console

# Sentry error reporting (if configured)
# Errors automatically sent to Sentry dashboard
```

### Performance Monitoring
```bash
# Web vitals in development
npm run dev
# Check browser dev tools > Performance tab

# Bundle size tracking
npm run analyze
# Check generated report
```

## Useful Development Tools

### Browser Extensions for Development
- Redux DevTools Extension
- React Developer Tools  
- Tailwind CSS IntelliSense
- Web Vitals

### VS Code Extensions
```bash
# Recommended extensions for VS Code
# Add to .vscode/extensions.json:
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## Team Development Guidelines

### Before Starting Work
1. `git pull origin develop`
2. `npm install`
3. `npm run dev` to ensure everything works
4. Create feature branch
5. Start development

### Before Committing
1. `npm run lint:fix`
2. `npm run format`  
3. `npm run test`
4. `npm run build` (ensure it builds)
5. Commit with descriptive message

### Code Review Checklist
- [ ] All tests pass
- [ ] No linting errors
- [ ] Code is formatted
- [ ] Component is responsive
- [ ] Accessibility considerations
- [ ] Performance implications considered

## Production Deployment

### Pre-deployment Checklist
```bash
# Run full test suite
npm run test:coverage

# Check bundle size
npm run build:analyze

# Security audit
npm run deps:audit

# Build for production
npm run build

# Test production build locally
npm run preview
```

### Environment Variables for Production
```bash
# Set production environment variables
VITE_API_BASE_URL=https://api.yourapp.com
VITE_APP_ENV=production
VITE_SENTRY_DSN=your-production-sentry-dsn
```
