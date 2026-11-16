const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const GitHubService = require('./src/services/GitHubService');
const AgentOrchestrator = require('./src/services/AgentOrchestrator');
const connectDB = require('./src/config/db');

async function testAnalysis() {
    console.log('Connecting to MongoDB...');
    await connectDB();

    const repoUrl = 'https://github.com/JatinxKumar/Campus-Connect-Hub';

    try {
        console.log('\n--- Step 1: Fetching Repository ---');
        const repoData = await GitHubService.fetchRepoContents(repoUrl);
        console.log('Repo Name:', repoData.repository);
        console.log('Stats:', repoData.stats);

        console.log('\n--- Step 2: Running DNA Extractor ---');
        const projectDNA = await AgentOrchestrator.runProjectDNAExtractor(repoData);
        console.log('Project DNA:', JSON.stringify(projectDNA, null, 2));

        console.log('\n--- Step 3: Running Full Pipeline ---');
        const analysis = await AgentOrchestrator.runFullAnalysisPipeline(repoData);
        console.log('Analysis Complete!');
        console.log('Tech Stack:', analysis.techStack);
        console.log('Health Score:', analysis.healthScore.overall);
        console.log('Explanation Length:', analysis.explanation.length);

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
}

testAnalysis();