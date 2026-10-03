const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const IMPORTANT_FILE_REGEX = /\.(js|jsx|ts|tsx|json|md|css|scss|html)$/i;
const SKIP_PATH_REGEX = /(^|\/)(node_modules|dist|build|coverage|\.git|\.next|public\/assets|assets|vendor)(\/|$)/i;

const IGNORE_PATTERNS = [
  'node_modules', 'dist', 'build', '.git', 'coverage',
  'package-lock.json', 'yarn.lock', '.next', 'public/assets',
  'assets', 'vendor', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.pdf'
];

const READ_PATTERNS = [
  'package.json', 'readme', 'src', 'backend', 'server', 'api',
  'controllers', 'routes', 'models', 'middleware', 'services', 'utils', 'config'
];

const CODE_EXTENSIONS = /\.(js|jsx|ts|tsx|py|go|java|cs|cpp|c|h|php|rb|html|css|json|md|sh|yaml|yml)$/i;
const MAX_FILES_TO_READ = 28;
const MAX_FILE_CHARS = 5500;
const MAX_TOTAL_CHARS = 45000;

class GitHubService {
  static getRepoParts(repoUrl) {
    const cleanUrl = repoUrl.replace(/\.git$/, '').replace(/\/$/, '');
    const parts = cleanUrl.split('/');
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];

    if (!owner || !repo || owner === 'github.com') {
      throw new Error("Invalid GitHub URL format");
    }

    return { owner, repo };
  }

  static isImportantFile(path) {
    const lowerPath = path.toLowerCase();
    if (SKIP_PATH_REGEX.test(lowerPath)) return false;

    const priorityFiles = [
      'package.json',
      'readme.md',
      'vite.config.ts',
      'vite.config.js',
      'next.config.js',
      'tailwind.config.js',
      'tailwind.config.ts',
      'tsconfig.json',
      'server.js',
      'app.js',
      'src/app.tsx',
      'src/app.jsx',
      'src/app.js',
      'src/main.tsx',
      'src/main.jsx',
      'src/main.js',
      'src/index.tsx',
      'src/index.jsx',
      'src/index.js',
    ];

    return priorityFiles.includes(lowerPath) || (
      lowerPath.startsWith('src/') &&
      IMPORTANT_FILE_REGEX.test(lowerPath) &&
      !lowerPath.includes('.test.') &&
      !lowerPath.includes('.spec.')
    );
  }

  static prioritizeFiles(files) {
    const weight = (path) => {
      const lower = path.toLowerCase();
      if (lower === 'package.json') return 0;
      if (lower === 'readme.md') return 1;
      if (lower.includes('vite.config') || lower.includes('next.config') || lower.includes('tailwind.config')) return 2;
      if (lower.includes('src/main') || lower.includes('src/index') || lower.includes('src/app')) return 3;
      if (lower.includes('/pages/') || lower.includes('/routes/')) return 4;
      if (lower.includes('/components/')) return 5;
      if (lower.includes('/context/') || lower.includes('/store/') || lower.includes('/hooks/')) return 6;
      if (lower.includes('/services/') || lower.includes('/api/') || lower.includes('/lib/')) return 7;
      return 9;
    };

    return files
      .filter((file) => file.type === 'blob' && this.isImportantFile(file.path))
      .sort((a, b) => weight(a.path) - weight(b.path) || a.path.length - b.path.length)
      .slice(0, MAX_FILES_TO_READ);
  }

  static async fetchRawFile(owner, repo, branch, path) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const response = await axios.get(url, { timeout: 8000, responseType: 'text' });
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
  }

  static async fetchRepoContents(repoUrl) {
    let tempPath = null;
    try {
      const { owner, repo } = this.getRepoParts(repoUrl);
      console.log(`Cloning repository locally: ${owner}/${repo}`);

      // Create a unique temporary directory
      const tempDirRoot = path.join(__dirname, '../../uploads/temp');
      if (!fs.existsSync(tempDirRoot)) {
        fs.mkdirSync(tempDirRoot, { recursive: true });
      }
      tempPath = path.join(tempDirRoot, `${owner}_${repo}_${Date.now()}`);

      // Clone repository
      try {
        console.log(`Executing: git clone --depth 1 "${repoUrl}" "${tempPath}"`);
        execSync(`git clone --depth 1 "${repoUrl}" "${tempPath}"`, { stdio: 'ignore', timeout: 30000 });
      } catch (cloneError) {
        console.warn("Git clone command failed, falling back to API fetch:", cloneError.message);
        return await this.fetchRepoContentsViaAPI(repoUrl);
      }

      // Read repo contents from filesystem
      const files = [];
      const structure = [];
      let totalFiles = 0;
      let totalDirs = 0;
      let linesOfCode = 0;
      let componentsCount = 0;
      let routesCount = 0;
      let modelsCount = 0;
      let servicesCount = 0;

      const traverse = (currentDir) => {
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const relativePath = path.relative(tempPath, fullPath).replace(/\\/g, '/');
          const lowerRelativePath = relativePath.toLowerCase();

          // Check ignore patterns
          const shouldIgnore = IGNORE_PATTERNS.some(p => 
            lowerRelativePath.split('/').includes(p) || lowerRelativePath.endsWith(p)
          );
          if (shouldIgnore) continue;

          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            totalDirs++;
            structure.push(`dir ${relativePath}`);
            traverse(fullPath);
          } else {
            totalFiles++;
            structure.push(`file ${relativePath}`);

            // Read file content
            let fileContent = '';
            try {
              fileContent = fs.readFileSync(fullPath, 'utf8');
            } catch (readError) {
              continue;
            }

            const lines = fileContent.split('\n').length;
            
            if (CODE_EXTENSIONS.test(relativePath)) {
              linesOfCode += lines;
            }

            // Categorize file (programmatic DNA checks)
            if (lowerRelativePath.includes('components/')) {
              componentsCount++;
            } else if (
              lowerRelativePath.includes('routes/') || 
              lowerRelativePath.includes('pages/') || 
              lowerRelativePath.includes('api/') ||
              /route\.(js|ts)$/.test(lowerRelativePath)
            ) {
              routesCount++;
            } else if (lowerRelativePath.includes('models/') || lowerRelativePath.includes('schemas/')) {
              modelsCount++;
            } else if (
              lowerRelativePath.includes('services/') || 
              lowerRelativePath.includes('controllers/') || 
              lowerRelativePath.includes('utils/') ||
              lowerRelativePath.includes('middleware/')
            ) {
              servicesCount++;
            }

            // Only add to files list if it matches the "Read" patterns
            const shouldRead = READ_PATTERNS.some(p => 
              lowerRelativePath.split('/').includes(p) || 
              lowerRelativePath.includes(`/${p}/`) ||
              lowerRelativePath.startsWith(`${p}/`) ||
              lowerRelativePath === p
            ) && CODE_EXTENSIONS.test(relativePath);

            if (shouldRead) {
              files.push({
                path: relativePath,
                size: stat.size,
                content: fileContent
              });
            }
          }
        }
      };

      traverse(tempPath);

      // Prioritize files to read (limit size for LLM input)
      let totalChars = 0;
      const sourceFiles = [];

      // Sort files: package.json first, then README, then configs, routes, etc.
      const weight = (p) => {
        const lower = p.toLowerCase();
        if (lower === 'package.json') return 0;
        if (lower.startsWith('readme')) return 1;
        if (lower.includes('config')) return 2;
        if (lower.includes('routes') || lower.includes('pages') || lower.includes('api')) return 3;
        if (lower.includes('models')) return 4;
        if (lower.includes('services') || lower.includes('controllers')) return 5;
        if (lower.includes('components')) return 6;
        return 9;
      };

      files.sort((a, b) => weight(a.path) - weight(b.path) || a.path.length - b.path.length);

      for (const file of files) {
        if (totalChars >= MAX_TOTAL_CHARS) break;
        const truncatedContent = file.content.slice(0, Math.min(MAX_FILE_CHARS, MAX_TOTAL_CHARS - totalChars));
        totalChars += truncatedContent.length;
        sourceFiles.push({
          path: file.path,
          size: file.size,
          content: truncatedContent
        });
      }

      const packageFile = sourceFiles.find((file) => file.path.toLowerCase() === 'package.json');
      let packageJson = null;
      if (packageFile) {
        try {
          packageJson = JSON.parse(packageFile.content);
        } catch (parseError) {
          packageJson = null;
        }
      }

      const readme = sourceFiles.find((file) => file.path.toLowerCase().startsWith('readme'))?.content || '';
      const dependencies = packageJson
        ? Object.keys({ ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) })
        : [];

      const repoContext = [
        `Repository: ${owner}/${repo}`,
        `Files scanned: ${totalFiles}`,
        `Files read: ${sourceFiles.map((file) => file.path).join(', ')}`,
        '',
        'Repository structure:',
        structure.slice(0, 180).join('\n'), // Cap structure length for context
        '',
        'Important file contents:',
        sourceFiles.map((file) => `--- ${file.path} ---\n${file.content}`).join('\n\n'),
      ].join('\n');

      return {
        repository: `${owner}/${repo}`,
        defaultBranch: 'main',
        description: packageJson?.description || '',
        rootFiles: fs.readdirSync(tempPath).map(name => ({
          name,
          type: fs.statSync(path.join(tempPath, name)).isDirectory() ? 'dir' : 'file',
          path: name
        })),
        structure,
        sourceFiles,
        readme,
        dependencies,
        repoContext,
        packageJson,
        stats: {
          totalFiles,
          totalDirs,
          filesRead: sourceFiles.length,
          contextChars: repoContext.length,
          componentsCount,
          routesCount,
          modelsCount,
          servicesCount,
          linesOfCode
        }
      };

    } catch (err) {
      console.error("Local repository analysis failed, falling back to API:", err.message);
      return await this.fetchRepoContentsViaAPI(repoUrl);
    } finally {
      // Clean up local temp folder
      if (tempPath && fs.existsSync(tempPath)) {
        try {
          console.log(`Cleaning up cloned folder: ${tempPath}`);
          const deleteFolderRecursive = (dir) => {
            if (fs.existsSync(dir)) {
              fs.readdirSync(dir).forEach((file) => {
                const curPath = path.join(dir, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                  deleteFolderRecursive(curPath);
                } else {
                  try {
                    fs.chmodSync(curPath, 0o666);
                  } catch (e) {}
                  fs.unlinkSync(curPath);
                }
              });
              fs.rmdirSync(dir);
            }
          };
          deleteFolderRecursive(tempPath);
        } catch (cleanupError) {
          console.warn("Could not clean up temp folder:", cleanupError.message);
        }
      }
    }
  }

  // Backup method using GitHub API (in case git is not installed or repo is private/unavailable)
  static async fetchRepoContentsViaAPI(repoUrl) {
    try {
      const { owner, repo } = this.getRepoParts(repoUrl);
      console.log(`Fetching GitHub repo via API: ${owner}/${repo}`);

      const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        timeout: 8000,
      });

      const defaultBranch = repoResponse.data.default_branch || 'main';
      const treeResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        timeout: 10000,
      });

      const tree = treeResponse.data.tree || [];
      const rootFiles = tree
        .filter((item) => !item.path.includes('/'))
        .map((item) => ({
          name: item.path,
          type: item.type === 'tree' ? 'dir' : 'file',
          path: item.path,
        }));

      const structure = tree
        .filter((item) => !SKIP_PATH_REGEX.test(item.path))
        .slice(0, 180)
        .map((item) => `${item.type === 'tree' ? 'dir ' : 'file'} ${item.path}`);

      // Estimate metric counts from structural tree
      let componentsCount = 0;
      let routesCount = 0;
      let modelsCount = 0;
      let servicesCount = 0;
      let totalFiles = 0;

      tree.forEach(item => {
        if (item.type === 'blob') {
          totalFiles++;
          const lowerPath = item.path.toLowerCase();
          if (lowerPath.includes('components/')) componentsCount++;
          else if (lowerPath.includes('routes/') || lowerPath.includes('pages/') || lowerPath.includes('api/')) routesCount++;
          else if (lowerPath.includes('models/') || lowerPath.includes('schemas/')) modelsCount++;
          else if (lowerPath.includes('services/') || lowerPath.includes('controllers/') || lowerPath.includes('utils/')) servicesCount++;
        }
      });

      const filesToRead = this.prioritizeFiles(tree);
      let totalChars = 0;
      const sourceFiles = [];

      for (const file of filesToRead) {
        if (totalChars >= MAX_TOTAL_CHARS) break;

        try {
          const raw = await this.fetchRawFile(owner, repo, defaultBranch, file.path);
          const content = raw.slice(0, Math.min(MAX_FILE_CHARS, MAX_TOTAL_CHARS - totalChars));
          totalChars += content.length;
          sourceFiles.push({ path: file.path, size: file.size, content });
        } catch (fileError) {
          console.warn(`Could not fetch file ${file.path}:`, fileError.message);
        }
      }

      const packageFile = sourceFiles.find((file) => file.path.toLowerCase() === 'package.json');
      let packageJson = null;
      if (packageFile) {
        try {
          packageJson = JSON.parse(packageFile.content);
        } catch (parseError) {
          packageJson = null;
        }
      }

      const readme = sourceFiles.find((file) => file.path.toLowerCase() === 'readme.md')?.content || '';
      const dependencies = packageJson
        ? Object.keys({ ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) })
        : [];

      // Calculate approximate lines of code from fetched files
      let linesOfCode = sourceFiles.reduce((acc, file) => acc + file.content.split('\n').length, 0);
      // Simple scaling extrapolation
      if (totalFiles > sourceFiles.length) {
        linesOfCode = Math.round(linesOfCode * (totalFiles / sourceFiles.length));
      }

      const repoContext = [
        `Repository: ${owner}/${repo}`,
        `Default branch: ${defaultBranch}`,
        `Description: ${repoResponse.data.description || 'No description provided'}`,
        `Files scanned: ${tree.filter((item) => item.type === 'blob').length}`,
        `Files read: ${sourceFiles.map((file) => file.path).join(', ')}`,
        '',
        'Repository structure:',
        structure.join('\n'),
        '',
        'Important file contents:',
        sourceFiles.map((file) => `--- ${file.path} ---\n${file.content}`).join('\n\n'),
      ].join('\n');

      return {
        repository: `${owner}/${repo}`,
        defaultBranch,
        description: repoResponse.data.description,
        rootFiles,
        structure,
        sourceFiles,
        readme,
        dependencies,
        repoContext,
        packageJson,
        stats: {
          totalFiles,
          totalDirs: tree.filter((item) => item.type === 'tree').length,
          filesRead: sourceFiles.length,
          contextChars: repoContext.length,
          componentsCount,
          routesCount,
          modelsCount,
          servicesCount,
          linesOfCode
        },
      };
    } catch (error) {
      console.error("GitHub API Fallback Error:", error.message);
      // Return mock data structure
      return {
        repository: "Mock/Sample-Project",
        rootFiles: [
          { name: "src", type: "dir", path: "src" },
          { name: "package.json", type: "file", path: "package.json" },
          { name: "README.md", type: "file", path: "README.md" },
        ],
        packageJson: {
          name: "sample-project",
          dependencies: { react: "^18.0.0", express: "^4.18.0", mongoose: "^7.0.0" },
        },
        structure: ["dir src", "file src/App.jsx", "file server.js", "file package.json", "file README.md"],
        sourceFiles: [
          { path: "src/App.jsx", content: "function App() { return <main>Sample project dashboard</main>; }" },
          { path: "server.js", content: "const express = require('express'); const app = express(); app.get('/api/health', (req, res) => res.json({ ok: true }));" },
          { path: "README.md", content: "Sample project with React frontend and Express backend." },
        ],
        repoContext: "Repository: Mock/Sample-Project\nStructure: src, package.json, README.md\nImportant file contents include React app and Express server.",
        dependencies: ["react", "express", "mongoose"],
        stats: {
          totalFiles: 3,
          totalDirs: 1,
          filesRead: 3,
          contextChars: 160,
          componentsCount: 1,
          routesCount: 1,
          modelsCount: 1,
          servicesCount: 1,
          linesOfCode: 150
        },
      };
    }
  }
}

module.exports = GitHubService;
