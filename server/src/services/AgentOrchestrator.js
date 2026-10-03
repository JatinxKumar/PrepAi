const GroqAgent = require('./GroqAgent');

const clampScore = (score) => Math.max(45, Math.min(96, Math.round(score)));

class AgentOrchestrator {
  static scoreProject(repoData) {
    const files = repoData.rootFiles || [];
    const packageJson = repoData.packageJson || {};
    const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
    const depNames = [...new Set([...(repoData.dependencies || []), ...Object.keys(deps)])].map((dep) => dep.toLowerCase());
    const fileNames = [
      ...files.map((file) => file.name.toLowerCase()),
      ...(repoData.structure || []).map((item) => item.toLowerCase()),
      ...(repoData.sourceFiles || []).map((file) => file.path.toLowerCase()),
    ];
    const sourceText = (repoData.sourceFiles || []).map((file) => file.content).join('\n').toLowerCase();
    const has = (name) => depNames.some((dep) => dep.includes(name)) || fileNames.some((file) => file.includes(name)) || sourceText.includes(name);
    const hasFile = (name) => fileNames.some((file) => file.endsWith(name));
    const featureCount = (repoData.stats?.totalFiles || files.length) + depNames.length;

    const performance = clampScore(55 + (has('vite') ? 10 : 0) + (has('react-query') || has('@tanstack') ? 8 : 0) + Math.min(depNames.length, 12));
    const codeQuality = clampScore(50 + (has('typescript') || hasFile('tsconfig.json') ? 12 : 0) + (has('eslint') ? 8 : 0) + (has('vitest') || has('testing-library') || has('jest') ? 10 : 0) + (hasFile('readme.md') ? 6 : 0) + Math.min(files.length, 10));
    const scalability = clampScore(48 + (has('supabase') || has('mongoose') || has('prisma') ? 12 : 0) + (has('react-query') || has('@tanstack') ? 8 : 0) + (has('express') || has('next') ? 8 : 0) + (hasFile('vercel.json') || has('docker') ? 6 : 0) + Math.min(featureCount / 2, 12));
    const uiux = clampScore(52 + (has('tailwind') ? 10 : 0) + (has('radix') || has('lucide') || has('framer-motion') ? 10 : 0) + (has('react-hook-form') ? 6 : 0) + (has('sonner') || has('toast') ? 4 : 0) + Math.min(depNames.length / 2, 10));
    const overall = Math.round((performance + codeQuality + scalability + uiux) / 4);

    return {
      overall,
      performance,
      codeQuality,
      scalability,
      uiux,
      signals: [
        has('typescript') || hasFile('tsconfig.json') ? 'TypeScript signal found' : 'Add TypeScript for stronger maintainability',
        has('testing-library') || has('vitest') || has('jest') ? 'Testing setup detected' : 'Testing setup not obvious',
        has('supabase') || has('mongoose') || has('prisma') ? 'Database layer detected' : 'Data layer not obvious',
        has('tailwind') || has('radix') ? 'Modern UI tooling detected' : 'UI system can be stronger',
      ],
    };
  }

  static extractTechStack(repoData) {
    const deps = repoData.dependencies || Object.keys({
      ...(repoData.packageJson?.dependencies || {}),
      ...(repoData.packageJson?.devDependencies || {}),
    });
    const fileNames = [
      ...(repoData.rootFiles || []).map((file) => file.name.toLowerCase()),
      ...(repoData.structure || []).map((item) => item.toLowerCase()),
      ...(repoData.sourceFiles || []).map((file) => file.path.toLowerCase()),
    ];
    const sourceText = [
      repoData.readme || '',
      repoData.repoContext || '',
      ...(repoData.sourceFiles || []).map((file) => file.content || ''),
    ].join('\n').toLowerCase();
    const hasSignal = (needle) =>
      deps.some((dep) => dep.toLowerCase().includes(needle)) ||
      fileNames.some((file) => file.includes(needle)) ||
      sourceText.includes(needle);

    const techMap = [
      ['react', 'React'],
      ['next', 'Next.js'],
      ['vite', 'Vite'],
      ['typescript', 'TypeScript'],
      ['tailwind', 'Tailwind CSS'],
      ['express', 'Express'],
      ['mongoose', 'Mongoose'],
      ['mongodb', 'MongoDB'],
      ['supabase', 'Supabase'],
      ['firebase', 'Firebase'],
      ['prisma', 'Prisma'],
      ['react-query', 'React Query'],
      ['@tanstack/react-query', 'React Query'],
      ['framer-motion', 'Framer Motion'],
      ['radix', 'Radix UI'],
      ['lucide', 'Lucide Icons'],
      ['zustand', 'Zustand'],
      ['redux', 'Redux'],
      ['node', 'Node.js'],
      ['postgres', 'PostgreSQL'],
      ['tailwindcss', 'Tailwind CSS'],
      ['vercel', 'Vercel'],
      ['netlify', 'Netlify'],
    ];

    const found = techMap
      .filter(([needle]) => hasSignal(needle))
      .map(([, label]) => label);

    if (hasSignal('api/') || hasSignal('server.js') || hasSignal('express') || hasSignal('controller')) {
      found.push('Backend API');
    }

    if ((repoData.sourceFiles || []).some((file) => /tsx?$/.test(file.path))) {
      found.push('JavaScript');
    }

    if ((repoData.sourceFiles || []).some((file) => /\.(ts|tsx)$/.test(file.path)) || hasSignal('typescript') || hasSignal('tsconfig.json')) {
      found.push('TypeScript');
    }

    if (!found.length) {
      if (hasSignal('src/') || hasSignal('component') || hasSignal('jsx') || hasSignal('tsx')) {
        found.push('Frontend App');
      }
      if (hasSignal('package.json')) {
        found.push('Node.js');
      }
      if (hasSignal('readme')) {
        found.push('README-driven project');
      }
    }

    return [...new Set(found)].slice(0, 10);
  }

  static async runProjectDNAExtractor(repoData) {
    const stats = repoData.stats || {};
    const prompt = `
You are a senior software architect. Analyze this repository context and its statistics to extract the "Project DNA" in strict JSON format.

Repository context and files:
${(repoData.repoContext || '').slice(0, 38000)}

Statistics:
- Total Files: ${stats.totalFiles || 0}
- Total LOC: ${stats.linesOfCode || 0}
- Component files: ${stats.componentsCount || 0}
- Route files: ${stats.routesCount || 0}
- Model files: ${stats.modelsCount || 0}
- Service/Util files: ${stats.servicesCount || 0}

Respond ONLY with a valid JSON object matching this structure:
{
  "projectName": "Name of the project",
  "category": "e.g., E-commerce, Portfolio, SaaS, Social Media, Tool, Utility, etc.",
  "complexity": "e.g., Low, Medium, High",
  "architecture": "e.g., MVC, Monolith, Serverless, Microservices, Client-Server",
  "frontend": "Frontend stack used (e.g., React, Vue, HTML/JS, Next.js, or None)",
  "backend": "Backend stack used (e.g., Express/Node, Flask, Go, Supabase, Firebase, or None)",
  "database": "Database used (e.g., MongoDB, PostgreSQL, SQLite, Firebase, or None)",
  "authentication": "Auth mechanism used (e.g., JWT, OAuth, Firebase Auth, none)",
  "apis": ["List of API technologies or integration types like REST, GraphQL, Stripe, Google Login"],
  "features": ["3 to 5 core features actually present and detected in the code"],
  "components": ${stats.componentsCount || 0},
  "routes": ${stats.routesCount || 0},
  "models": ${stats.modelsCount || 0},
  "services": ${stats.servicesCount || 0},
  "files": ${stats.totalFiles || 0},
  "linesOfCode": ${stats.linesOfCode || 0}
}
Do not include any markdown fences or explanation. Only return the JSON.`;

    const result = await GroqAgent.generate(prompt, "You are a JSON generator that analyzes code and structure to return metadata. Output strict JSON only.");
    try {
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return JSON.parse(result);
    } catch (err) {
      console.error("Failed to parse Project DNA, using fallback:", err.message);
      return {
        projectName: repoData.repository || "Unknown Project",
        category: "Utility",
        complexity: "Medium",
        architecture: "Client-Server",
        frontend: "React",
        backend: "Node/Express",
        database: "MongoDB",
        authentication: "JWT",
        apis: ["REST"],
        features: ["Code Scanner", "AI Analysis"],
        components: stats.componentsCount || 0,
        routes: stats.routesCount || 0,
        models: stats.modelsCount || 0,
        services: stats.servicesCount || 0,
        files: stats.totalFiles || 0,
        linesOfCode: stats.linesOfCode || 0
      };
    }
  }

  static async runProjectStoryAgent(projectDNA, repoData) {
    const prompt = `
You are a senior principal engineer explaining a repository to a technical reviewer.
Generate a comprehensive, professional engineering project story document.
Do not sound like ChatGPT. Use natural, technical, professional engineering language.

Project DNA:
${JSON.stringify(projectDNA, null, 2)}

Repository Files & Code:
${(repoData.repoContext || '').slice(0, 36000)}

Generate the story document containing EXACTLY these sections. Use capitalized section titles like "[SECTION_NAME]" for clear distinction:

[PROJECT IDENTITY]
- Project Name: ${projectDNA.projectName}
- Category: ${projectDNA.category}
- Difficulty: ${projectDNA.complexity}
- Architecture: ${projectDNA.architecture}
- Development Scale: (Small/Medium/Enterprise based on file count and lines of code)
- Estimated Development Time: (Realistic estimate, e.g., 40 hours, 120 hours)

[WHY THIS PROJECT EXISTS]
(Explain the real-world problem this project aims to solve and its business/technical rationale.)

[HOW THE SYSTEM WORKS]
(Explain the end-to-end user flow: how a user interacts, how requests traverse the frontend, reach routes, hit middleware/controllers, query the database, and return a response.)

[ARCHITECTURE BREAKDOWN]
- Frontend: (Detailed frontend architecture and routing details)
- Backend: (Detailed backend router, api, structure)
- Database: (Models, data schemas, data layer details)
- Authentication: (How users are authenticated, security details)
- External APIs: (APIs or external service integrations detected)
- Deployment: (Inferred deployment stack: Vercel, Heroku, Docker, etc.)

[KEY FEATURES]
(List only the features actually detected inside the code files. Do not hallucinate or guess features not present in the code.)

[ENGINEERING DECISIONS]
- Why React: (Explain technical reasons if React is used)
- Why Express: (Explain technical reasons if Express is used)
- Why MongoDB: (Explain technical reasons if MongoDB is used)
- Why JWT: (Explain technical reasons if JWT is used)
- Why Tailwind: (Explain technical reasons if Tailwind is used)
(Adapt this list based on the actual technologies in the Project DNA.)

[CODE HIGHLIGHTS]
- Largest Component: (Identify the largest component file and explain its scope)
- Most Important Route: (Identify the main API endpoint/route)
- Business Logic: (Explain where the core logic lives)
- Interesting Algorithms: (Explain state management, custom calculations, or unique logics if any)
- Custom Hooks: (Describe any custom hooks detected)
- Reusable Components: (Describe key shared/ui elements)

[CHALLENGES]
(Detail 2-3 realistic development/engineering challenges encountered during building this project, such as async data handling, state synchronization, security configuration, or complex database relationships.)

[IMPROVEMENTS]
(Suggest 3-4 highly realistic technical improvements based on weaknesses found during the repository analysis.)

[RESUME SUMMARY]
(Generate 4 highly impactful, ATS-ready resume bullet points using the XYZ format: "Accomplished [X] as measured by [Y], by doing [Z]".)

[INTERVIEW STORY]
(Provide a natural, professional 2-minute project pitch that a student can speak during placement interviews to showcase deep ownership, technical depth, and architectural awareness.)
`;

    return await GroqAgent.generate(prompt, "You are a principal software engineer drafting a detailed technical review document.");
  }

  static async runArchitectureAgent(story) {
    const prompt = `Based on this project story, summarize the technical system architecture description. Detail the data flow, component interactions, and infrastructure choices. \n\n${story}`;
    return await GroqAgent.generate(prompt, "You are a Senior Solutions Architect.");
  }

  static async runVivaAgent(story) {
    const prompt = `Based on this project story, predict 8 cross-questioning/viva questions a recruiter might ask. Include a mix of technical (how it works) and conceptual (why this choice). Provide the ideal answers. Format strictly as a JSON array of objects with 'question' and 'answer' keys. \n\n${story}`;
    const result = await GroqAgent.generate(prompt, "You are a strict technical interviewer at a top-tier tech firm.");
    try {
      const jsonStr = result.match(/\[.*\]/s)[0];
      return JSON.parse(jsonStr);
    } catch (e) {
      return [];
    }
  }

  static async runResumeAgent(story) {
    const prompt = `Extract the key achievements and unique features of this project into 5 highly impactful, ATS-friendly resume bullet points using the XYZ format (Accomplished [X] as measured by [Y], by doing [Z]). Return strictly as a JSON array of strings. \n\n${story}`;
    const result = await GroqAgent.generate(prompt, "You are an expert technical resume writer and recruiter.");
    try {
      const jsonStr = result.match(/\[.*\]/s)[0];
      return JSON.parse(jsonStr);
    } catch (e) {
      return [];
    }
  }

  static async runImprovementAgent(story) {
    const prompt = `Based on this project story, list 3-5 concrete ways to improve the project. Return strictly as a line-separated or bullet-separated text. \n\n${story}`;
    return await GroqAgent.generate(prompt, "You are a Senior Product Engineer looking for ways to scale projects.");
  }

  static async runDemoScriptAgent(story) {
    const prompt = `Based on this project story, draft a concise 2-minute demo script. Include an intro, key feature walkthrough, and a concluding statement. Format it as a sequence of steps. \n\n${story}`;
    return await GroqAgent.generate(prompt, "You are a Product Demo specialist.");
  }

  static async runFullAnalysisPipeline(repoData) {
    // 1. Extract Project DNA
    console.log("Extracting Project DNA...");
    const projectDNA = await this.runProjectDNAExtractor(repoData);

    // 2. Generate DNA-driven Project Story
    console.log("Generating DNA-driven Project Story...");
    const explanation = await this.runProjectStoryAgent(projectDNA, repoData);

    // 3. Run rest of agents sequentially to respect API rate limits
    console.log("Running follow-up analysis agents...");
    const architecture = await this.runArchitectureAgent(explanation);
    const vivaPrep = await this.runVivaAgent(explanation);
    const resumePoints = await this.runResumeAgent(explanation);
    const improvements = await this.runImprovementAgent(explanation);
    const demoScript = await this.runDemoScriptAgent(explanation);

    return {
      overview: explanation.slice(0, 1000) + "...", // Quick overview text
      explanation, // The complete story
      architecture,
      techStack: this.extractTechStack(repoData),
      healthScore: this.scoreProject(repoData),
      vivaPrep,
      resumePoints,
      improvements,
      demoScript,
      projectDNA
    };
  }
}

module.exports = AgentOrchestrator;
