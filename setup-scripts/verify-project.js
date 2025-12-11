#!/usr/bin/env node

/**
 * Project Verification Script
 * Validates that all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

const checks = [
  // Root level
  {
    name: 'Root package.json',
    path: 'package.json',
    type: 'file',
    critical: true
  },
  {
    name: 'Root .gitignore',
    path: '.gitignore',
    type: 'file',
    critical: true
  },
  {
    name: 'README',
    path: 'README.md',
    type: 'file',
    critical: false
  },

  // Client
  {
    name: 'Client package.json',
    path: 'client/package.json',
    type: 'file',
    critical: true
  },
  {
    name: 'Vite config',
    path: 'client/vite.config.js',
    type: 'file',
    critical: true
  },
  {
    name: 'Tailwind config',
    path: 'client/tailwind.config.js',
    type: 'file',
    critical: true
  },
  {
    name: 'Client src directory',
    path: 'client/src',
    type: 'dir',
    critical: true
  },

  // Server
  {
    name: 'Server package.json',
    path: 'server/package.json',
    type: 'file',
    critical: true
  },
  {
    name: 'Server src directory',
    path: 'server/src',
    type: 'dir',
    critical: true
  },
  {
    name: 'Server jest config',
    path: 'server/jest.config.js',
    type: 'file',
    critical: false
  },

  // Optional but recommended
  {
    name: 'Environment example',
    path: '.env.example',
    type: 'file',
    critical: false,
    recommendation: 'Create .env.example with required environment variables'
  },
  {
    name: 'GitHub Actions workflows',
    path: '.github/workflows',
    type: 'dir',
    critical: false,
    recommendation: 'Set up CI/CD pipelines'
  }
];

class ProjectVerifier {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  verify() {
    console.log('✔️  PROJECT VERIFICATION\n');
    console.log('=' .repeat(50));

    checks.forEach(check => {
      const fullPath = path.join(this.rootDir, check.path);
      const exists = fs.existsSync(fullPath);
      const isStat = exists ? fs.statSync(fullPath) : null;
      const isCorrectType = check.type === 'dir' 
        ? (isStat?.isDirectory() || false)
        : (isStat?.isFile() || false);

      if (exists && isCorrectType) {
        this.results.passed.push(check.name);
        console.log(`✅ ${check.name}`);
      } else {
        const message = `❌ ${check.name}`;
        console.log(message);
        if (check.critical) {
          this.results.failed.push(check);
        } else {
          this.results.warnings.push(check);
        }
      }
    });

    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 Results:`);
    console.log(`  ✅ Passed: ${this.results.passed.length}`);
    console.log(`  ⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`  ❌ Critical Missing: ${this.results.failed.length}`);

    if (this.results.warnings.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.warnings.forEach(item => {
        if (item.recommendation) {
          console.log(`  • ${item.recommendation}`);
        }
      });
    }

    const hasFailures = this.results.failed.length > 0;
    console.log('\n' + '='.repeat(50) + '\n');
    
    if (hasFailures) {
      console.log('❌ Verification failed! Critical files are missing.\n');
      process.exit(1);
    } else {
      console.log('✅ Verification passed!\n');
      process.exit(0);
    }
  }
}

const verifier = new ProjectVerifier(process.argv[2] || process.cwd());
verifier.verify();
