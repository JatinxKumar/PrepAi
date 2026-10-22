# 🚀 PrepAI — Your Projects. Your Skills. Your Placement Story.

<p align="center">
  <strong>Understand your code. Build your story. Prepare for placements.</strong>
</p>

<p align="center">
  An AI-powered placement preparation platform that transforms your GitHub projects and resume into actionable interview preparation.
</p>

<p align="center">
  <a href="https://prepai-pearl.vercel.app/">🌐 Live Demo</a> •
  <a href="https://github.com/JatinxKumar/PrepAi">💻 GitHub Repository</a>
</p>

---

## ✨ About PrepAI

**PrepAI** is an AI-powered placement preparation platform designed to help students understand their own projects, improve their resumes, and prepare for technical interviews.

Instead of providing generic interview questions, PrepAI focuses on the work you have actually built. It analyzes project structures, extracts technical signals, and helps turn implementation details into clear, interview-ready explanations.

**The goal:** Help students confidently explain what they built, why they built it, and how it works.

## 🎯 Key Features

### 🔍 GitHub Project Intelligence
- Analyze project repositories and their structures.
- Identify dependencies, technologies, and important implementation details.
- Understand project architecture and code organization.
- Generate project insights to support technical interview preparation.

### 📄 AI Resume Tailoring
- Upload and manage resume information.
- Analyze resume content against a target job description.
- Identify relevant skills and evidence from existing projects.
- Generate tailored resume suggestions while keeping the candidate's real experience central.

### 🎤 Interview & Viva Preparation
- Prepare to explain projects in technical interviews.
- Generate project-specific questions and answers.
- Practice explaining architecture, implementation choices, and trade-offs.
- Improve confidence through structured preparation.

### 🧠 Placement Intelligence
- Turn technical project details into recruiter-friendly project stories.
- Identify potential areas for improvement in code quality, performance, and scalability.
- Organize preparation around actual skills and project evidence.

> Feature availability depends on the current application implementation and configured AI services.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| AI Integration | LLM APIs, Groq SDK |
| Embeddings | Transformers.js, `all-MiniLM-L6-v2` |
| Deployment | Vercel |
| Development Tools | Git, GitHub, npm |

*The stack may evolve as the project develops.*

## 🏗️ Project Structure

```text
PrepAi/
├── api/              # Deployment/API entry points
├── client/           # Frontend application
├── server/           # Backend application
├── package.json
├── package-lock.json
├── vercel.json
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- Git
- MongoDB Atlas account or a compatible MongoDB instance
- Required AI provider credentials, if using API-based AI features

### 1. Clone the repository

```bash
git clone https://github.com/JatinxKumar/PrepAi.git
cd PrepAi
```

### 2. Install dependencies

```bash
npm install
```

If the frontend and backend maintain separate package files, install their dependencies in the respective directories as well.

### 3. Configure environment variables

Create the required `.env` files based on the environment variables used by the application.

Example configuration:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Use only the variables required by the current implementation. Never commit real API keys, database credentials, or secrets to GitHub.

### 4. Start the application

Run the scripts defined in the root, client, and server `package.json` files.

For example, if the corresponding scripts exist:

```bash
npm run dev
```

Check the project scripts before running commands, as the frontend and backend may require separate terminals.

## 🧩 How PrepAI Works

```text
GitHub Repository / Resume
            |
            v
    Data Extraction
            |
            v
 Project & Resume Analysis
            |
            v
 AI / Retrieval Pipeline
            |
            v
 Actionable Insights
            |
            v
 Interview & Placement Prep
```

The pipeline is intended to connect real project evidence with practical placement preparation. Exact processing steps depend on the enabled modules.

## 🎓 Who Is It For?

- Students preparing for campus placements.
- Developers who want to explain their projects confidently.
- Candidates tailoring resumes for specific job descriptions.
- Students who want to identify gaps in their technical understanding.
- Learners building full-stack and AI-powered applications.

## 🔐 Security & Privacy

- Keep API credentials in environment variables.
- Never expose private keys in frontend code or public repositories.
- Validate uploaded files and incoming API requests.
- Protect user-specific resume data with appropriate authentication and authorization.
- Review third-party AI provider policies before sending personal information.

## 🚧 Future Improvements

- Automated testing and continuous integration with GitHub Actions.
- More reliable repository analysis and project-specific question generation.
- Improved resume evidence retrieval and job-description matching.
- Better feedback on technical explanations and interview answers.
- Performance optimization and improved error handling.

## 👨‍💻 Author

**Jatin Kumar**

B.Tech Computer Science Engineering student focused on full-stack development, DSA, and practical AI applications.

- GitHub: [@JatinxKumar](https://github.com/JatinxKumar)
- LinkedIn: [Jatin Kumar](https://www.linkedin.com/in/jatinkxkumar/)
- Live Project: [PrepAI](https://prepai-pearl.vercel.app/)

---

<p align="center">
  <strong>Build projects worth explaining. Understand them well enough to defend them.</strong>
</p>

<p align="center">
  Made with ❤️ for developers preparing for their next opportunity.
</p>
