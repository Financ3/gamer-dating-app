// Check the password hash in the database
require('dotenv').config();
const massive = require('massive');
const bcrypt = require('bcryptjs');

(async () => {
  const db = await massive({
    connectionString: process.env.CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });

  const result = await db.instance.$pool.query(
    'SELECT user_id, email, hash FROM users WHERE email = \'tanner.francis11@gmail.com\''
  );

  if (result.rows.length === 0) {
    console.log('User not found!');
    process.exit(1);
  }

  const user = result.rows[0];
  console.log(`\nUser: ${user.email}`);
  console.log(`Hash: ${user.hash.substring(0, 20)}...`);

  // Test both passwords
  const passwords = ['testpass123#', 'NewTestPass123#'];

  console.log('\nTesting passwords against stored hash:');
  for (const password of passwords) {
    const matches = bcrypt.compareSync(password, user.hash);
    console.log(`  ${password}: ${matches ? '✓ MATCH' : '✗ no match'}`);
  }

  process.exit(0);
})();
