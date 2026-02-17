// Optional: Use this to generate test SMTP credentials for development
// Run: node server/utils/testEmailSetup.js

const nodemailer = require('nodemailer');

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();

  console.log('\n=== Test Email Account Created ===');
  console.log('Add these to your .env file:\n');
  console.log(`EMAIL_HOST=${testAccount.smtp.host}`);
  console.log(`EMAIL_PORT=${testAccount.smtp.port}`);
  console.log(`EMAIL_USER=${testAccount.user}`);
  console.log(`EMAIL_PASSWORD=${testAccount.pass}`);
  console.log(`EMAIL_FROM=One Up Dating <noreply@oneup.com>`);
  console.log(`CLIENT_URL=http://localhost:3000`);
  console.log('\nNote: Emails will be captured at https://ethereal.email/');
  console.log('Check your inbox at: https://ethereal.email/messages');
}

createTestAccount();
