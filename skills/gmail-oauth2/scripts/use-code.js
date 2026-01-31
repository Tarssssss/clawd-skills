/**
 * Use authorization code to get and save tokens
 */

const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
];

const TOKEN_PATH = path.join(__dirname, 'gmail-tokens.json');

(async () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const authCode = process.argv[2];

  if (!authCode) {
    console.log('Usage: node use-code.js <authorization-code>');
    process.exit(1);
  }

  console.log('🔐 Using authorization code to get tokens...');

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  try {
    const { tokens } = await oAuth2Client.getToken(authCode);
    console.log('✅ Got tokens!');

    // Save tokens
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('✅ Tokens saved to', TOKEN_PATH);

    // Test the connection
    oAuth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    console.log('\n🎉 Gmail access authorized successfully!');
    console.log('📧 Email:', profile.data.emailAddress);
    console.log('📊 Messages total:', profile.data.messagesTotal);
    console.log('📨 Threads total:', profile.data.threadsTotal);
    console.log('\n✅ You can now use Gmail scripts (check.js, search.js, send.js, get.js)\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
})();
