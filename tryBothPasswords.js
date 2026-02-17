// Try both possible passwords
const axios = require('axios');

const passwords = ['testpass123#', 'NewTestPass123#'];
const email = 'TANNER.FRANCIS11@GMAIL.COM'; // Testing with uppercase

async function testLogin(email, password) {
  try {
    const response = await axios.post('http://localhost:5050/auth/login', {
      email,
      password
    });
    console.log(`✓ SUCCESS with password: ${password}`);
    console.log(`  User: ${response.data.email}`);
    return true;
  } catch (error) {
    console.log(`✗ Failed with password: ${password}`);
    return false;
  }
}

(async () => {
  console.log(`\nTrying to login with: ${email}\n`);
  for (const password of passwords) {
    await testLogin(email, password);
  }
})();
