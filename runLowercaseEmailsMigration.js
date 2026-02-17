// Run this with: node runLowercaseEmailsMigration.js
// This will convert all existing emails to lowercase for case-insensitive lookups

require('dotenv').config();
const massive = require('massive');
const path = require('path');
const fs = require('fs');

const runMigration = async () => {
  console.log('\n============================================');
  console.log(' Lowercase Emails Migration Script');
  console.log('============================================\n');
  console.log('This will convert all existing emails to lowercase.');
  console.log('This ensures case-insensitive email lookups.\n');

  try {
    // Connect to database
    console.log('Connecting to database...');
    const db = await massive({
      connectionString: process.env.CONNECTION_STRING,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log('✓ Connected to database\n');

    // Get current emails before migration
    const beforeResult = await db.instance.$pool.query('SELECT email FROM users ORDER BY user_id');
    console.log('Current emails in database:');
    beforeResult.rows.forEach(row => console.log(`  - ${row.email}`));
    console.log('');

    // Read migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'db/migrations/003_lowercase_emails.sql'),
      'utf8'
    );

    // Run migration
    console.log('Running migration...');
    await db.instance.$pool.query(migrationSQL);

    console.log('\n✓ Migration completed successfully!\n');

    // Verify emails are now lowercase
    const afterResult = await db.instance.$pool.query('SELECT email FROM users ORDER BY user_id');
    console.log('Updated emails in database:');
    afterResult.rows.forEach(row => console.log(`  - ${row.email}`));

    console.log('\n============================================');
    console.log('Migration complete!');
    console.log('All emails are now lowercase.');
    console.log('============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

runMigration();
