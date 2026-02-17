// Run this with: node runMigration.js
// This will add password reset columns to the users table

require('dotenv').config();
const massive = require('massive');
const path = require('path');
const fs = require('fs');

const runMigration = async () => {
  console.log('\n============================================');
  console.log(' Password Reset Migration Script');
  console.log('============================================\n');
  console.log('This will add the following columns to the users table:');
  console.log('  - reset_token (TEXT)');
  console.log('  - reset_token_expiry (BIGINT)\n');
  console.log('Your existing data will NOT be deleted.\n');

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

    // Read migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'db/migrations/001_add_password_reset_columns.sql'),
      'utf8'
    );

    // Run migration
    console.log('Running migration...');
    await db.instance.$pool.query(migrationSQL);

    console.log('\n✓ Migration completed successfully!\n');
    console.log('The users table now has password reset columns.\n');

    // Verify columns exist
    const result = await db.instance.$pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('reset_token', 'reset_token_expiry')
      ORDER BY column_name;
    `);

    if (result.rows.length === 2) {
      console.log('✓ Verified: Both columns exist in the database');
      console.log('\nColumn details:');
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('⚠ Warning: Could not verify columns were added');
    }

    console.log('\n============================================');
    console.log('Migration complete!');
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
