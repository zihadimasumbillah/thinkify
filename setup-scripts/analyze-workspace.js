#!/usr/bin/env node

/**
 * Workspace Analysis Script
 * Analyzes the Thinkify project structure and generates a detailed report
 */

const fs = require('fs');
const path = require('path');

class WorkspaceAnalyzer {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.stats = {
      totalFiles: 0,
      totalDirs: 0,
      filesByType: {},
      sizeByType: 0,
      projectStructure: {},
      dependencies: {
        client: [],
        server: []
      },
      issues: []
    };
  }

  analyze() {
    console.log('🔍 Analyzing workspace structure...\n');
    
    this.walkDir(this.rootDir, this.stats.projectStructure);
    this.analyzeDependencies();
    this.checkConfiguration();
    this.generateReport();
  }

  walkDir(dir, structure, depth = 0) {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        if (this.shouldIgnore(file)) return;

        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const relative = path.relative(this.rootDir, fullPath);

        if (stat.isDirectory()) {
          this.stats.totalDirs++;
          structure[file] = {};
          this.walkDir(fullPath, structure[file], depth + 1);
        } else {
          this.stats.totalFiles++;
          const ext = path.extname(file) || 'no-extension';
          this.stats.filesByType[ext] = (this.stats.filesByType[ext] || 0) + 1;
        }
      });
    } catch (error) {
      this.stats.issues.push(`Error reading ${dir}: ${error.message}`);
    }
  }

  shouldIgnore(file) {
    const ignoreList = [
      'node_modules', '.git', '.next', 'dist', 'build', '.env',
      '.DS_Store', '.vscode', '.idea', 'coverage', '.nyc_output'
    ];
    return ignoreList.includes(file);
  }

  analyzeDependencies() {
    try {
      const clientPkg = JSON.parse(
        fs.readFileSync(path.join(this.rootDir, 'client/package.json'), 'utf8')
      );
      const serverPkg = JSON.parse(
        fs.readFileSync(path.join(this.rootDir, 'server/package.json'), 'utf8')
      );

      this.stats.dependencies.client = {
        dependencies: Object.keys(clientPkg.dependencies || {}),
        devDependencies: Object.keys(clientPkg.devDependencies || {})
      };

      this.stats.dependencies.server = {
        dependencies: Object.keys(serverPkg.dependencies || {}),
        devDependencies: Object.keys(serverPkg.devDependencies || {})
      };
    } catch (error) {
      this.stats.issues.push(`Error reading package.json: ${error.message}`);
    }
  }

  checkConfiguration() {
    const configFiles = [
      { path: '.gitignore', name: 'Git ignore' },
      { path: '.env.example', name: 'Environment example' },
      { path: 'client/.env.local', name: 'Client env' },
      { path: 'server/.env', name: 'Server env' }
    ];

    configFiles.forEach(config => {
      const fullPath = path.join(this.rootDir, config.path);
      if (!fs.existsSync(fullPath)) {
        this.stats.issues.push(`⚠️  Missing: ${config.name} (${config.path})`);
      }
    });
  }

  generateReport() {
    console.log('📊 WORKSPACE ANALYSIS REPORT\n');
    console.log('=' .repeat(50));
    
    console.log('\n📁 Structure Overview:');
    console.log(`  Total Directories: ${this.stats.totalDirs}`);
    console.log(`  Total Files: ${this.stats.totalFiles}`);
    
    console.log('\n📄 File Types Distribution:');
    Object.entries(this.stats.filesByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type || 'no-extension'}: ${count} files`);
      });

    console.log('\n📦 Client Dependencies:');
    console.log(`  Dependencies: ${this.stats.dependencies.client.dependencies?.length || 0}`);
    console.log(`  Dev Dependencies: ${this.stats.dependencies.client.devDependencies?.length || 0}`);

    console.log('\n📦 Server Dependencies:');
    console.log(`  Dependencies: ${this.stats.dependencies.server.dependencies?.length || 0}`);
    console.log(`  Dev Dependencies: ${this.stats.dependencies.server.devDependencies?.length || 0}`);

    if (this.stats.issues.length > 0) {
      console.log('\n⚠️  Issues Found:');
      this.stats.issues.forEach(issue => console.log(`  ${issue}`));
    } else {
      console.log('\n✅ No configuration issues detected');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Analysis complete!\n');

    return this.stats;
  }
}

const analyzer = new WorkspaceAnalyzer(process.argv[2] || process.cwd());
analyzer.analyze();
