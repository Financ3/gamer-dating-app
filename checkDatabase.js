// Check what's actually in the database
require('dotenv').config();
const massive = require('massive');

(async () => {
  const db = await massive({
    connectionString: process.env.CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });

  const result = await db.instance.$pool.query(
    'SELECT user_id, email FROM users WHERE email LIKE \'%tanner%\' OR email LIKE \'%Tanner%\''
  );

  console.log('\nUsers with "tanner" in email:');
  console.log(result.rows);

  // Try to get user with lowercase
  const [user1] = await db.get_user('tanner.francis11@gmail.com');
  console.log('\nget_user with lowercase:');
  console.log(user1 ? `Found: ${user1.email}` : 'Not found');

  // Try with mixed case
  const [user2] = await db.get_user('Tanner.Francis11@gmail.com');
  console.log('\nget_user with mixed case:');
  console.log(user2 ? `Found: ${user2.email}` : 'Not found');

  process.exit(0);
})();
