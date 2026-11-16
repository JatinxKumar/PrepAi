const http = require('http');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('./src/server.js');

async function runTests() {
    console.log('====================================================');
    console.log('RUNNING AUTOMATED EMAIL/PASSWORD AUTHENTICATION TESTS');
    console.log('====================================================');

    const server = http.createServer(app);
    const TEST_PORT = 5893;

    await new Promise((resolve) => server.listen(TEST_PORT, resolve));
    const baseUrl = `http://localhost:${TEST_PORT}/api/auth`;

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  [PASS] ${message}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${message}`);
            failed++;
        }
    }

    try {
        // TEST 1: Health Check endpoint
        console.log('\nTest 1: Public API health check');
        const healthRes = await axios.get(`http://localhost:${TEST_PORT}/api/health`);
        assert(healthRes.status === 200, 'Health check returns 200 OK');
        assert(healthRes.data?.status === 'ok', 'Health response payload has status: ok');

        // TEST 2: Signup with valid data
        console.log('\nTest 2: Signup with valid data');
        const testUser = {
            name: 'Test User',
            email: `testuser_${Date.now()}@example.com`,
            password: 'TestPassword123'
        };
        try {
            const signupRes = await axios.post(`${baseUrl}/signup`, testUser);
            assert(signupRes.status === 201, 'Signup returns HTTP 201');
            assert(signupRes.data?.message === 'Account created successfully', 'Returns success message');
            assert(signupRes.data?.token, 'Returns authentication token');
            assert(signupRes.data?.user?.email === testUser.email, 'Returns user email');
            assert(signupRes.data?.user?.name === testUser.name, 'Returns user name');
            assert(!signupRes.data?.user?.password, 'Does not return password');
            console.log(`  Created user: ${signupRes.data.user.email}`);
        } catch (err) {
            console.error('Signup error:', err.response?.data || err.message);
            throw err;
        }

        // TEST 3: Login with valid credentials
        console.log('\nTest 3: Login with valid credentials');
        try {
            const loginRes = await axios.post(`${baseUrl}/login`, {
                email: testUser.email,
                password: testUser.password
            });
            assert(loginRes.status === 200, 'Login returns HTTP 200');
            assert(loginRes.data?.message === 'Login successful', 'Returns success message');
            assert(loginRes.data?.token, 'Returns authentication token');
            assert(loginRes.data?.user?.email === testUser.email, 'Returns user email');
            assert(loginRes.data?.user?.name === testUser.name, 'Returns user name');
            assert(!loginRes.data?.user?.password, 'Does not return password');
            console.log(`  Logged in user: ${loginRes.data.user.email}`);
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            throw err;
        }

        // TEST 4: Duplicate email signup
        console.log('\nTest 4: Duplicate email signup');
        try {
            await axios.post(`${baseUrl}/signup`, testUser);
            assert(false, 'Expected 400 on duplicate email');
        } catch (err) {
            assert(err.response?.status === 400, 'Returns HTTP 400 on duplicate email');
            assert(
                err.response?.data?.error === 'User already exists with this email.',
                'Returns correct error message for duplicate email'
            );
        }

        // TEST 5: Login with invalid password
        console.log('\nTest 5: Login with invalid password');
        try {
            await axios.post(`${baseUrl}/login`, {
                email: testUser.email,
                password: 'WrongPassword123'
            });
            assert(false, 'Expected 401 on invalid password');
        } catch (err) {
            assert(err.response?.status === 401, 'Returns HTTP 401 on invalid password');
            assert(
                err.response?.data?.error === 'Invalid email or password.',
                'Returns correct error message for invalid password'
            );
        }

        // TEST 6: Login with non-existent email
        console.log('\nTest 6: Login with non-existent email');
        try {
            await axios.post(`${baseUrl}/login`, {
                email: 'nonexistent@example.com',
                password: 'TestPassword123'
            });
            assert(false, 'Expected 401 on non-existent email');
        } catch (err) {
            assert(err.response?.status === 401, 'Returns HTTP 401 on non-existent email');
            assert(
                err.response?.data?.error === 'Invalid email or password.',
                'Returns correct error message for non-existent email'
            );
        }

        // TEST 7: Missing fields in signup
        console.log('\nTest 7: Missing fields in signup');
        try {
            await axios.post(`${baseUrl}/signup`, {
                name: 'Test User'
                // Missing email and password
            });
            assert(false, 'Expected 400 on missing fields');
        } catch (err) {
            assert(err.response?.status === 400, 'Returns HTTP 400 on missing fields');
            assert(
                err.response?.data?.error === 'All fields are required.',
                'Returns correct error message for missing fields'
            );
        }

        // TEST 8: Missing fields in login
        console.log('\nTest 8: Missing fields in login');
        try {
            await axios.post(`${baseUrl}/login`, {
                email: 'test@example.com'
                // Missing password
            });
            assert(false, 'Expected 400 on missing password');
        } catch (err) {
            assert(err.response?.status === 400, 'Returns HTTP 400 on missing password');
            assert(
                err.response?.data?.error === 'Email and password are required.',
                'Returns correct error message for missing password'
            );
        }

        // TEST 9: Password strength validation (minimum length)
        console.log('\nTest 9: Password strength validation (minimum length)');
        try {
            await axios.post(`${baseUrl}/signup`, {
                name: 'Test User',
                email: `testuser_short_${Date.now()}@example.com`,
                password: '123' // Too short
            });
            assert(false, 'Expected 400 on weak password');
        } catch (err) {
            // Note: Current implementation doesn't validate password strength
            // This test documents the expected behavior
            console.log('  Note: Current implementation does not validate password strength');
        }

        // TEST 10: Email format validation
        console.log('\nTest 10: Email format validation');
        try {
            await axios.post(`${baseUrl}/signup`, {
                name: 'Test User',
                email: 'invalid-email-format',
                password: 'TestPassword123'
            });
            assert(false, 'Expected 400 on invalid email format');
        } catch (err) {
            // Note: Current implementation doesn't validate email format
            // This test documents the expected behavior
            console.log('  Note: Current implementation does not validate email format');
        }

        // TEST 11: Name validation
        console.log('\nTest 11: Name validation');
        try {
            await axios.post(`${baseUrl}/signup`, {
                name: '', // Empty name
                email: `testuser_empty_${Date.now()}@example.com`,
                password: 'TestPassword123'
            });
            assert(false, 'Expected 400 on empty name');
        } catch (err) {
            // Note: Current implementation doesn't validate name
            // This test documents the expected behavior
            console.log('  Note: Current implementation does not validate name');
        }

        // TEST 12: Authentication token verification
        console.log('\nTest 12: Authentication token verification');
        try {
            const loginRes = await axios.post(`${baseUrl}/login`, {
                email: testUser.email,
                password: testUser.password
            });
            const token = loginRes.data.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            assert(decoded.email === testUser.email, 'Token contains correct email');
            assert(decoded.name === testUser.name, 'Token contains correct name');
            assert(decoded.id, 'Token contains user ID');
            console.log('  Token verification successful');
        } catch (err) {
            console.error('Token verification error:', err.message);
            throw err;
        }

        // TEST 13: Password hashing
        console.log('\nTest 13: Password hashing');
        try {
            const user = await require('./src/models/User').findOne({ email: testUser.email });
            assert(user, 'User exists in database');
            assert(user.password !== testUser.password, 'Password is not stored in plain text');
            assert(await bcrypt.compare(testUser.password, user.password), 'Password can be verified with bcrypt');
            console.log('  Password hashing verified');
        } catch (err) {
            console.error('Password hashing error:', err.message);
            throw err;
        }

        console.log('\n----------------------------------------------------');
        console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
        console.log('----------------------------------------------------');
    } catch (error) {
        console.error('Test execution failed:', error);
        failed++;
    } finally {
        server.close();
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();