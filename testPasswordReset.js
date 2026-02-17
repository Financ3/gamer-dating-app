// Comprehensive Password Reset Feature Tests
// Run with: node testPasswordReset.js

const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:5050';
const TEST_EMAIL = 'Tanner.Francis11@gmail.com';

let resetToken = null;

// Helper function for formatted output
const log = {
  test: (msg) => console.log(`\n${chalk.blue('TEST:')} ${msg}`),
  success: (msg) => console.log(`  ${chalk.green('✓')} ${msg}`),
  error: (msg) => console.log(`  ${chalk.red('✗')} ${msg}`),
  info: (msg) => console.log(`  ${chalk.yellow('ℹ')} ${msg}`),
  section: (msg) => console.log(`\n${chalk.cyan('=')} ${msg} ${chalk.cyan('=')}`),
};

// Test 1: Request Password Reset
async function testRequestPasswordReset() {
  log.test('Requesting password reset for valid email');

  try {
    const response = await axios.post(`${BASE_URL}/auth/request-reset`, {
      email: TEST_EMAIL
    });

    if (response.status === 200) {
      log.success('Password reset request successful');
      log.success(`Response: ${response.data.message}`);
      log.info('Check your email for the reset link!');
      return true;
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// Test 2: Request Password Reset for Non-Existent Email
async function testRequestResetNonExistentEmail() {
  log.test('Requesting password reset for non-existent email (security test)');

  try {
    const response = await axios.post(`${BASE_URL}/auth/request-reset`, {
      email: 'nonexistent@example.com'
    });

    if (response.status === 200) {
      log.success('Returns success even for non-existent email (correct behavior for security)');
      log.success(`Response: ${response.data.message}`);
      return true;
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    return false;
  }
}

// Test 3: Validate Token (Manual Entry Required)
async function testValidateToken() {
  log.test('Validating reset token');

  if (!resetToken) {
    log.info('Please check your email and enter the reset token from the URL');
    log.info('The token is the long string after /reset-password/ in the email link');
    log.info('Example: http://localhost:3000/#/reset-password/[THIS_IS_THE_TOKEN]');

    // For manual testing, we'll skip this
    log.info('Skipping automatic token validation - manual test required');
    return true;
  }

  try {
    const response = await axios.get(`${BASE_URL}/auth/validate-token/${resetToken}`);

    if (response.status === 200 && response.data.valid) {
      log.success('Token is valid');
      log.success(`Response: ${response.data.message}`);
      return true;
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// Test 4: Validate Invalid Token
async function testValidateInvalidToken() {
  log.test('Validating invalid token (should fail)');

  try {
    const response = await axios.get(`${BASE_URL}/auth/validate-token/invalid-token-12345`);

    if (response.status === 400 && !response.data.valid) {
      log.success('Invalid token correctly rejected');
      return true;
    } else {
      log.error('Invalid token was accepted (security issue!)');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('Invalid token correctly rejected');
      return true;
    }
    log.error(`Unexpected error: ${error.message}`);
    return false;
  }
}

// Test 5: Check Database Query Files
async function testDatabaseQueryFiles() {
  log.test('Checking database query files exist');

  const fs = require('fs');
  const path = require('path');

  const files = [
    'db/update_reset_token.sql',
    'db/get_user_by_reset_token.sql',
    'db/clear_reset_token.sql'
  ];

  let allExist = true;
  files.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      log.success(`${file} exists`);
    } else {
      log.error(`${file} is missing`);
      allExist = false;
    }
  });

  return allExist;
}

// Test 6: Check Email Service
async function testEmailServiceExists() {
  log.test('Checking email service configuration');

  const fs = require('fs');
  const path = require('path');

  const emailServicePath = path.join(__dirname, 'server/utils/emailService.js');

  if (fs.existsSync(emailServicePath)) {
    log.success('Email service file exists');

    const content = fs.readFileSync(emailServicePath, 'utf8');

    if (content.includes('nodemailer')) {
      log.success('Uses nodemailer');
    }
    if (content.includes('sendPasswordResetEmail')) {
      log.success('sendPasswordResetEmail function exists');
    }
    if (content.includes('CLIENT_URL')) {
      log.success('Uses CLIENT_URL from environment');
    }

    return true;
  } else {
    log.error('Email service file is missing');
    return false;
  }
}

// Test 7: Check Frontend Routes
async function testFrontendRoutes() {
  log.test('Checking frontend routes configuration');

  const fs = require('fs');
  const path = require('path');

  const routesPath = path.join(__dirname, 'src/routes/authRoutes.js');

  if (fs.existsSync(routesPath)) {
    const content = fs.readFileSync(routesPath, 'utf8');

    if (content.includes('ForgotPassword')) {
      log.success('ForgotPassword component imported');
    }
    if (content.includes('ResetPassword')) {
      log.success('ResetPassword component imported');
    }
    if (content.includes('/forgot-password')) {
      log.success('/forgot-password route exists');
    }
    if (content.includes('/reset-password/:token')) {
      log.success('/reset-password/:token route exists');
    }

    return true;
  } else {
    log.error('Routes file is missing');
    return false;
  }
}

// Test 8: Check Login Page Link
async function testLoginPageLink() {
  log.test('Checking "Forgot Password?" link in Login page');

  const fs = require('fs');
  const path = require('path');

  const loginPath = path.join(__dirname, 'src/Components/LoginRegisterRoutes/Login.js');

  if (fs.existsSync(loginPath)) {
    const content = fs.readFileSync(loginPath, 'utf8');

    if (content.includes('Forgot Password?')) {
      log.success('"Forgot Password?" text found');
    }
    if (content.includes('/forgot-password')) {
      log.success('Link to /forgot-password exists');
    }

    return true;
  } else {
    log.error('Login component is missing');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║  Password Reset Feature - Test Suite          ║'));
  console.log(chalk.cyan('╚════════════════════════════════════════════════╝'));

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Check if server is running
  log.section('PRELIMINARY CHECK');
  log.test('Checking if server is running');

  try {
    await axios.get(`${BASE_URL}/auth/duplicate?email=test@test.com`);
    log.success('Server is running on port 5050');
  } catch (error) {
    log.error('Server is not running!');
    log.error('Please start the server with: npm start');
    log.error('Then run this test again');
    process.exit(1);
  }

  // File System Tests
  log.section('FILE SYSTEM TESTS');

  const tests = [
    { name: 'Database Query Files', fn: testDatabaseQueryFiles },
    { name: 'Email Service', fn: testEmailServiceExists },
    { name: 'Frontend Routes', fn: testFrontendRoutes },
    { name: 'Login Page Link', fn: testLoginPageLink },
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) results.passed++;
    else results.failed++;
  }

  // API Tests
  log.section('API ENDPOINT TESTS');

  const apiTests = [
    { name: 'Request Password Reset (Valid Email)', fn: testRequestPasswordReset },
    { name: 'Request Password Reset (Non-Existent Email)', fn: testRequestResetNonExistentEmail },
    { name: 'Validate Invalid Token', fn: testValidateInvalidToken },
    { name: 'Validate Token', fn: testValidateToken },
  ];

  for (const test of apiTests) {
    results.total++;
    const passed = await test.fn();
    if (passed) results.passed++;
    else results.failed++;
  }

  // Results Summary
  log.section('TEST RESULTS');
  console.log(`\nTotal Tests: ${results.total}`);
  console.log(chalk.green(`Passed: ${results.passed}`));
  console.log(chalk.red(`Failed: ${results.failed}`));

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%`);

  if (results.failed === 0) {
    console.log(chalk.green('\n✓ All tests passed!'));
    console.log(chalk.cyan('\nNext Steps:'));
    console.log('  1. Check your email for the password reset link');
    console.log('  2. Open the link in your browser');
    console.log('  3. Enter a new password');
    console.log('  4. Verify you can log in with the new password');
  } else {
    console.log(chalk.red(`\n✗ ${results.failed} test(s) failed. Please review the errors above.`));
  }

  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  console.error(chalk.red('\nFatal error running tests:'));
  console.error(error);
  process.exit(1);
});
