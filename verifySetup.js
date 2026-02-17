// Run this with: node verifySetup.js
// This verifies your password reset setup is complete

require('dotenv').config();
const massive = require('massive');

const verifySetup = async () => {
  console.log('\n============================================');
  console.log(' Password Reset Setup Verification');
  console.log('============================================\n');

  let allGood = true;

  // Check 1: Environment Variables
  console.log('1. Checking environment variables...');
  const requiredVars = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
    'CLIENT_URL'
  ];

  requiredVars.forEach(varName => {
    if (process.env[varName] && !process.env[varName].includes('REPLACE')) {
      console.log(`   ✓ ${varName} is set`);
    } else {
      console.log(`   ✗ ${varName} is missing or needs to be updated`);
      allGood = false;
    }
  });

  // Check 2: Database Columns
  console.log('\n2. Checking database columns...');
  try {
    const db = await massive({
      connectionString: process.env.CONNECTION_STRING,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const result = await db.instance.$pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('reset_token', 'reset_token_expiry')
      ORDER BY column_name;
    `);

    if (result.rows.length === 2) {
      console.log('   ✓ reset_token column exists');
      console.log('   ✓ reset_token_expiry column exists');
    } else {
      console.log('   ✗ Database columns are missing. Run: node runMigration.js');
      allGood = false;
    }

    // Check 3: SQL Files
    console.log('\n3. Checking SQL query files...');
    const fs = require('fs');
    const path = require('path');

    const sqlFiles = [
      'db/update_reset_token.sql',
      'db/get_user_by_reset_token.sql',
      'db/clear_reset_token.sql'
    ];

    sqlFiles.forEach(file => {
      if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`   ✓ ${file} exists`);
      } else {
        console.log(`   ✗ ${file} is missing`);
        allGood = false;
      }
    });

    // Check 4: Frontend Components
    console.log('\n4. Checking frontend components...');
    const components = [
      'src/Components/LoginRegisterRoutes/ForgotPassword.js',
      'src/Components/LoginRegisterRoutes/ResetPassword.js'
    ];

    components.forEach(file => {
      if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`   ✓ ${file} exists`);
      } else {
        console.log(`   ✗ ${file} is missing`);
        allGood = false;
      }
    });

    console.log('\n============================================');
    if (allGood) {
      console.log('✓ Setup is complete! You\'re ready to test.');
      console.log('\nNext steps:');
      console.log('  1. Start your server: npm start');
      console.log('  2. Navigate to: http://localhost:3000/login');
      console.log('  3. Click "Forgot Password?"');
      console.log('  4. Test the password reset flow');
    } else {
      console.log('✗ Setup is incomplete. Fix the issues above.');
      console.log('\nCommon fixes:');
      console.log('  - Update .env with real email credentials');
      console.log('  - Run: node runMigration.js');
    }
    console.log('============================================\n');

    process.exit(allGood ? 0 : 1);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
};

verifySetup();
