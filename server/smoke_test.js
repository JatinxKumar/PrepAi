const http = require('http');
const app = require('./src/server.js');
const server = http.createServer(app);
const PORT = 5894;

function timeout(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
}

async function run() {
    server.listen(PORT, async () => {
        console.log('Server started on port', PORT);
        let hasError = false;
        try {
            // Test 1: Health check
            console.log('\n=== Test 1: Health Check ===');
            const health = await fetch('http://localhost:' + PORT + '/api/health');
            console.log('Health:', health.status, await health.json());

            // Test 2: Signup
            console.log('\n=== Test 2: Signup ===');
            const signupRes = await fetch('http://localhost:' + PORT + '/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'SmokeTest User', email: 'smoketest_' + Date.now() + '@example.com', password: 'SmokeTest123' })
            });
            const signupData = await signupRes.json();
            console.log('Signup:', signupRes.status, JSON.stringify(signupData).substring(0, 300));

            // Test 3: Login
            console.log('\n=== Test 3: Login ===');
            const loginRes = await fetch('http://localhost:' + PORT + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupData.user.email, password: 'SmokeTest123' })
            });
            const loginData = await loginRes.json();
            console.log('Login:', loginRes.status, JSON.stringify(loginData).substring(0, 300));

            // Test 4: Analyze project
            console.log('\n=== Test 4: Analyze Project ===');
            const analyzeRes = await fetch('http://localhost:' + PORT + '/api/projects/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + loginData.token },
                body: JSON.stringify({ repositoryUrl: 'https://github.com/Jatin-404/Campus-Connect-Hub' })
            });
            const analyzeData = await analyzeRes.json();
            console.log('Analyze:', analyzeRes.status);
            if (analyzeData.projectDNA) {
                console.log('Project DNA:', JSON.stringify(analyzeData.projectDNA).substring(0, 500));
            }
            if (analyzeData.analysis) {
                console.log('Analysis techStack:', JSON.stringify(analyzeData.analysis.techStack));
                console.log('Analysis overview:', JSON.stringify(analyzeData.analysis.overview || '').substring(0, 200));
            }

            server.close();
        } catch (e) {
            console.error('Error:', e.message);
            hasError = true;
            server.close();
        }
    });
}

run();