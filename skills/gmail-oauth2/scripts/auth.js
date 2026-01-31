/**
 * Gmail OAuth2 Authentication
 * 
 * Run this to authorize access to your Gmail account.
 * This will open a browser window for you to log in.
 */

const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const url = require('url');
const { google } = require('googleapis');
const open = require('open');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
];

const TOKEN_PATH = path.join(__dirname, 'gmail-tokens.json');
const PORT = 3000;

/**
 * Load or create OAuth2 client
 */
async function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('\n❌ Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env');
    console.log('\n📋 How to get these credentials:');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
    console.log('2. Create a new project (or select existing)');
    console.log('3. Click "+ Create Credentials" → "OAuth client ID"');
    console.log('4. Application type: "Web application"');
    console.log('5. Name: "Clawdbot Gmail"');
    console.log('6. Add "http://127.0.0.1:3000" to "Authorized redirect URIs"');
    console.log('7. Copy Client ID and Client Secret to .env file\n');
    process.exit(1);
  }

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `http://127.0.0.1:${PORT}`
  );

  // Try to load existing token
  try {
    const token = await fs.readFile(TOKEN_PATH, 'utf8');
    oAuth2Client.setCredentials(JSON.parse(token));
    console.log('✅ Loaded existing token from', TOKEN_PATH);
    return oAuth2Client;
  } catch (err) {
    // No token exists, need to authorize
    console.log('🔐 No existing token found. Starting authorization...');
    return await authorize(oAuth2Client);
  }
}

/**
 * Get and store new token using local HTTP server callback
 */
async function authorize(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const parsedUrl = url.parse(req.url, true);
        const code = parsedUrl.query.code;

        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('❌ Authorization code not found in URL');
          reject(new Error('Authorization code not found'));
          return;
        }

        // Exchange code for tokens
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Save token for future use
        await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));

        // Send success response
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Authorization Successful</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 400px;
              }
              h1 { color: #28a745; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
              code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ 授权成功！</h1>
              <p>Gmail 访问已授权</p>
              <p>令牌已保存到<br><code>gmail-tokens.json</code></p>
              <p>现在可以关闭此窗口了</p>
            </div>
          </body>
          </html>
        `);

        // Close server and resolve
        server.close();
        console.log('\n✅ Token saved to', TOKEN_PATH);
        console.log('\n🎉 Gmail access authorized successfully!\n');
        resolve(oAuth2Client);
      } catch (err) {
        console.error('\n❌ Error retrieving access token:', err.message);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>Authorization Failed</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #dc3545;">❌ 授权失败</h1>
            <p>${err.message}</p>
            <p>请重新运行授权脚本</p>
          </body>
          </html>
        `);
        server.close();
        reject(err);
      }
    });

    server.listen(PORT, '127.0.0.1', async () => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
      });

      console.log('\n🌐 Authorization URL:');
      console.log('\n' + authUrl + '\n');

      // Try to open in browser
      try {
        await open(authUrl);
        console.log('✅ Opened in browser. If not, copy the URL above manually.\n');
      } catch (err) {
        console.log('⚠️  Could not auto-open browser. Please copy the URL above.\n');
      }

      console.log('🔄 Waiting for authorization callback on http://127.0.0.1:' + PORT);
      console.log('   (The browser will redirect back here after you authorize)\n');
    });
  });
}

/**
 * Test the connection
 */
async function testConnection() {
  try {
    const auth = await getOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });

    const profile = await gmail.users.getProfile({ userId: 'me' });
    console.log('\n✅ Connected to Gmail!');
    console.log('📧 Email:', profile.data.emailAddress);
    console.log('📊 Messages total:', profile.data.messagesTotal);
    console.log('📨 Threads total:', profile.data.threadsTotal);
    console.log();

    return auth;
  } catch (err) {
    console.error('\n❌ Error connecting to Gmail:', err.message);
    
    if (err.message.includes('invalid_grant')) {
      console.log('\n⚠️  Token expired or invalid. Deleting and re-authorizing...');
      await fs.unlink(TOKEN_PATH).catch(() => {});
      console.log('Please run this script again to re-authorize.\n');
    }
    
    throw err;
  }
}

// Main
(async () => {
  try {
    const auth = await testConnection();
    console.log('✅ You can now use other Gmail scripts (check.js, search.js, send.js)\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Authorization failed:', err.message);
    process.exit(1);
  }
})();
