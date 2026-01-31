/**
 * Check Gmail for unread/new messages
 */

const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const TOKEN_PATH = path.join(__dirname, 'gmail-tokens.json');

async function getGmailClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const tokenData = await fs.readFile(TOKEN_PATH, 'utf8');

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials(JSON.parse(tokenData));

  return google.gmail({ version: 'v1', auth });
}

async function checkEmails(limit = 10, recent = null) {
  const gmail = await getGmailClient();

  // Build search query
  let query = 'is:unread';
  if (recent) {
    query += ` newer_than:${recent}`;
  }

  const messages = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: limit,
  });

  if (!messages.data.messages) {
    console.log('📭 No unread messages found.');
    return [];
  }

  const results = [];
  for (const msg of messages.data.messages) {
    const full = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject', 'Date'],
    });

    const headers = full.data.payload.headers.reduce((acc, h) => {
      acc[h.name] = h.value;
      return acc;
    }, {});

    results.push({
      id: full.data.id,
      threadId: full.data.threadId,
      from: headers['From'] || 'Unknown',
      subject: headers['Subject'] || '(No subject)',
      date: headers['Date'] || '',
      snippet: full.data.snippet || '',
    });
  }

  return results;
}

// CLI
(async () => {
  try {
    const args = process.argv.slice(2);
    let limit = 10;
    let recent = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--limit' && args[i + 1]) {
        limit = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--recent' && args[i + 1]) {
        recent = args[i + 1];
        i++;
      }
    }

    const messages = await checkEmails(limit, recent);

    console.log(`\n📬 Found ${messages.length} unread message${messages.length !== 1 ? 's' : ''}:\n`);

    messages.forEach((msg, idx) => {
      console.log(`${idx + 1}. ${msg.from}`);
      console.log(`   Subject: ${msg.subject}`);
      console.log(`   Date: ${msg.date}`);
      console.log(`   ID: ${msg.id}`);
      console.log(`   Snippet: ${msg.snippet.substring(0, 100)}...`);
      console.log();
    });

    // Output JSON for programmatic use
    console.log('--- JSON ---');
    console.log(JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
