// Test case-insensitive login with correct password
const axios = require('axios');
const chalk = require('chalk');

const PASSWORD = 'Trackfly123#';
const emailVariations = [
  'tanner.francis11@gmail.com',    // lowercase (stored in DB)
  'Tanner.Francis11@gmail.com',    // original mixed case
  'TANNER.FRANCIS11@GMAIL.COM',    // all uppercase
  'TaNnEr.FrAnCiS11@GmAiL.CoM',    // random mixed case
];

async function testLogin(email) {
  try {
    const response = await axios.post('http://localhost:5050/auth/login', {
      email,
      password: PASSWORD
    });
    console.log(chalk.green(`  ✓ SUCCESS: ${email}`));
    console.log(chalk.gray(`    → Logged in as: ${response.data.email}`));
    return true;
  } catch (error) {
    console.log(chalk.red(`  ✗ FAILED: ${email}`));
    console.log(chalk.gray(`    → Error: ${error.response?.data || error.message}`));
    return false;
  }
}

(async () => {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║  Case-Insensitive Login Test (Final Verification)     ║'));
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════╝\n'));

  console.log(chalk.yellow('Testing login with password:'), PASSWORD);
  console.log(chalk.yellow('Testing with different email case variations:\n'));

  let passed = 0;
  for (const email of emailVariations) {
    if (await testLogin(email)) passed++;
  }

  console.log(chalk.cyan('\n=== RESULTS ==='));
  console.log(`Total Tests: ${emailVariations.length}`);
  console.log(chalk.green(`Passed: ${passed}`));
  console.log(chalk.red(`Failed: ${emailVariations.length - passed}`));

  if (passed === emailVariations.length) {
    console.log(chalk.green('\n✓ All tests passed! Case-insensitive login is working!\n'));
  } else {
    console.log(chalk.red(`\n✗ ${emailVariations.length - passed} test(s) failed.\n`));
  }
})();
