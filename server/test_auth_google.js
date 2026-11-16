const http = require('http');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = require('./src/server.js');

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING AUTOMATED AUTHENTICATION & GOOGLE LOGIN TESTS');
  console.log('====================================================');

  const server = http.createServer(app);
  const TEST_PORT = 5892;

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
    // TEST 1: Missing Token
    console.log('\nTest 1: Missing token in request body');
    try {
      await axios.post(`${baseUrl}/google`, {});
      assert(false, 'Expected 401 on missing token');
    } catch (err) {
      assert(err.response?.status === 401, 'Returns HTTP 401 on missing token');
      assert(
        err.response?.data?.error === 'Invalid or expired Google authentication token',
        'Returns correct client-facing error message without internal traces'
      );
    }

    // TEST 2: Malformed Token
    console.log('\nTest 2: Malformed token string');
    try {
      await axios.post(`${baseUrl}/google`, { idToken: 'not.a.valid.jwt' });
      assert(false, 'Expected 401 on malformed token');
    } catch (err) {
      assert(err.response?.status === 401, 'Returns HTTP 401 on malformed token');
      assert(
        err.response?.data?.error === 'Invalid or expired Google authentication token',
        'Returns safe error without leaking parser exceptions'
      );
    }

    // TEST 3: Forged / Self-signed token with non-existent kid
    console.log('\nTest 3: Forged token with invalid kid');
    const forgedToken = jwt.sign(
      { sub: 'hacker-123', email: 'hacker@example.com', name: 'Hacker' },
      'some-random-private-key',
      { header: { kid: 'non-existent-google-kid' } }
    );
    try {
      await axios.post(`${baseUrl}/google`, { idToken: forgedToken });
      assert(false, 'Expected 401 on forged token');
    } catch (err) {
      assert(err.response?.status === 401, 'Returns HTTP 401 on untrusted key ID');
      assert(
        err.response?.data?.error === 'Invalid or expired Google authentication token',
        'Rejects untrusted key ID'
      );
    }

    // TEST 4: Expired token structure with forged signature
    console.log('\nTest 4: Expired token structure');
    const expiredToken = jwt.sign(
      { sub: 'user-123', email: 'user@example.com', exp: Math.floor(Date.now() / 1000) - 3600 },
      'fake-key',
      { header: { kid: 'fake-kid' } }
    );
    try {
      await axios.post(`${baseUrl}/google`, { idToken: expiredToken });
      assert(false, 'Expected 401 on expired token');
    } catch (err) {
      assert(err.response?.status === 401, 'Returns HTTP 401 on expired token');
    }

    // TEST 5: Health Check endpoint
    console.log('\nTest 5: Public API health check');
    const healthRes = await axios.get(`http://localhost:${TEST_PORT}/api/health`);
    assert(healthRes.status === 200, 'Health check returns 200 OK');
    assert(healthRes.data?.status === 'ok', 'Health response payload has status: ok');

    // TEST 6: Check eager module loading
    console.log('\nTest 6: Eager loading boundary verification');
    const loadedModules = Object.keys(require.cache);
    const canvasFound = loadedModules.some((m) => m.includes('@napi-rs/canvas'));
    const pdfDistFound = loadedModules.some((m) => m.includes('pdfjs-dist'));
    assert(!canvasFound, 'No native @napi-rs/canvas eagerly loaded in auth pipeline');
    assert(!pdfDistFound, 'No pdfjs-dist eagerly loaded in auth pipeline');

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
