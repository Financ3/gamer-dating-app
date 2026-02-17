// Test case-insensitive email lookups
// Run with: node testCaseInsensitiveEmails.js

const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:5050';

// Test with various case combinations of the same email
const TEST_CASES = [
  'tanner.francis11@gmail.com',    // lowercase (stored in DB)
  'Tanner.Francis11@gmail.com',    // original mixed case
  'TANNER.FRANCIS11@GMAIL.COM',    // all uppercase
  'TaNnEr.FrAnCiS11@GmAiL.CoM',    // random mixed case
];

const log = {
  test: (msg) => console.log(`\n${chalk.blue('TEST:')} ${msg}`),
  success: (msg) => console.log(`  ${chalk.green('✓')} ${msg}`),
  error: (msg) => console.log(`  ${chalk.red('✗')} ${msg}`),
  info: (msg) => console.log(`  ${chalk.yellow('→')} ${msg}`),
};

async function testLogin(email, password = 'testpass123#') {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: email,
      password: password
    });

    if (response.status === 200) {
      log.success(`Login successful with: ${email}`);
      return true;
    }
  } catch (error) {
    if (error.response && error.response.status === 403) {
      log.error(`Login failed with: ${email}`);
    } else {
      log.error(`Error with: ${email} - ${error.message}`);
    }
    return false;
  }
}

async function testPasswordReset(email) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/request-reset`, {
      email: email
    });

    if (response.status === 200) {
      log.success(`Password reset successful with: ${email}`);
      return true;
    }
  } catch (error) {
    log.error(`Password reset failed with: ${email} - ${error.message}`);
    return false;
  }
}

async function testDuplicate(email) {
  try {
    const response = await axios.get(`${BASE_URL}/auth/duplicate?email=${encodeURIComponent(email)}`);

    if (response.status === 200 && response.data === true) {
      log.success(`Duplicate check found email (correct): ${email}`);
      return true;
    } else {
      log.error(`Duplicate check did not find email: ${email}`);
      return false;
    }
  } catch (error) {
    log.error(`Duplicate check error with: ${email} - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║  Case-Insensitive Email Lookup Tests                  ║'));
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════╝\n'));

  log.info('Testing that all case variations of the same email work...\n');

  let totalTests = 0;
  let passedTests = 0;

  // Test Login with different cases
  console.log(chalk.cyan('\n=== LOGIN TESTS ==='));
  for (const email of TEST_CASES) {
    totalTests++;
    const passed = await testLogin(email);
    if (passed) passedTests++;
  }

  // Test Password Reset with different cases
  console.log(chalk.cyan('\n=== PASSWORD RESET TESTS ==='));
  for (const email of TEST_CASES) {
    totalTests++;
    const passed = await testPasswordReset(email);
    if (passed) passedTests++;
  }

  // Test Duplicate Check with different cases
  console.log(chalk.cyan('\n=== DUPLICATE CHECK TESTS ==='));
  for (const email of TEST_CASES) {
    totalTests++;
    const passed = await testDuplicate(email);
    if (passed) passedTests++;
  }

  // Results
  console.log(chalk.cyan('\n=== RESULTS ==='));
  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(chalk.green(`Passed: ${passedTests}`));
  console.log(chalk.red(`Failed: ${totalTests - passedTests}`));

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%`);

  if (passedTests === totalTests) {
    console.log(chalk.green('\n✓ All case-insensitive email tests passed!'));
    console.log(chalk.cyan('\nEmails are now case-insensitive across the application.'));
    console.log('Users can log in with any case variation of their email.\n');
  } else {
    console.log(chalk.red(`\n✗ ${totalTests - passedTests} test(s) failed.\n`));
  }
}

// Check if server is running first
axios.get(`${BASE_URL}/auth/duplicate?email=test@test.com`)
  .then(() => {
    log.success('Server is running');
    runTests();
  })
  .catch(() => {
    log.error('Server is not running!');
    log.error('Please start the server with: npm start');
    process.exit(1);
  });
