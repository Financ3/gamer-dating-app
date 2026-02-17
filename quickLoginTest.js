// Quick test to verify case-insensitive login works
const axios = require('axios');

const tests = [
  { email: 'tanner.francis11@gmail.com', password: 'NewTestPass123#' },
  { email: 'TANNER.FRANCIS11@GMAIL.COM', password: 'NewTestPass123#' },
  { email: 'TaNnEr.FrAnCiS11@gmail.com', password: 'NewTestPass123#' },
];

async function testLogin(email, password) {
  try {
    const response = await axios.post('http://localhost:5050/auth/login', {
      email,
      password
    });
    console.log(`✓ SUCCESS: ${email}`);
    return true;
  } catch (error) {
    console.log(`✗ FAILED: ${email} - ${error.response?.data || error.message}`);
    return false;
  }
}

(async () => {
  console.log('\nTesting case-insensitive login...\n');
  let passed = 0;
  for (const test of tests) {
    if (await testLogin(test.email, test.password)) passed++;
  }
  console.log(`\nResult: ${passed}/${tests.length} passed\n`);
})();
