const http = require('http');
const app = require('./src/server.js');
const server = http.createServer(app);
const PORT = 5895;

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

            // Test 4: Get Profile (Me)
            console.log('\n=== Test 4: Get Profile (Me) ===');
            const meRes = await fetch('http://localhost:' + PORT + '/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + loginData.token
                }
            });
            const meData = await meRes.json();
            console.log('Get Profile:', meRes.status, JSON.stringify(meData));

            server.close();
            process.exit(0);
        } catch (e) {
            console.error('Error:', e.message);
            hasError = true;
            server.close();
            process.exit(1);
        }
    });
}

run();