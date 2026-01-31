/**
 * Search Gmail messages
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

async function searchEmails(query, limit = 20) {
  const gmail = await getGmailClient();

  const messages = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: limit,
  });

  if (!messages.data.messages) {
    console.log(`📭 No messages found for query: "${query}"`);
    return [];
  }

  const results = [];
  for (const msg of messages.data.messages) {
    const full = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject', 'Date', 'To'],
    });

    const headers = full.data.payload.headers.reduce((acc, h) => {
      acc[h.name] = h.value;
      return acc;
    }, {});

    results.push({
      id: full.data.id,
      threadId: full.data.threadId,
      from: headers['From'] || 'Unknown',
      to: headers['To'] || 'Unknown',
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
    
    let query = '';
    let limit = 20;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--limit' && args[i + 1]) {
        limit = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--from' && args[i + 1]) {
        query += ` from:${args[i + 1]}`;
        i++;
      } else if (args[i] === '--to' && args[i + 1]) {
        query += ` to:${args[i + 1]}`;
        i++;
      } else if (args[i] === '--subject' && args[i + 1]) {
        query += ` subject:${args[i + 1]}`;
        i++;
      } else if (args[i] === '--recent' && args[i + 1]) {
        query += ` newer_than:${args[i + 1]}`;
        i++;
      } else if (!args[i].startsWith('--')) {
        query += ' ' + args[i];
      }
    }

    query = query.trim();

    if (!query) {
      console.log('❌ Error: Please provide a search query\n');
      console.log('Usage: node search.js <query> [options]');
      console.log('  --limit <n>       Max results (default: 20)');
      console.log('  --from <email>    From address contains');
      console.log('  --to <email>      To address contains');
      console.log('  --subject <text>  Subject contains');
      console.log('  --recent <time>   From last X time (e.g., 30m, 2h, 7d)');
      console.log('\nExamples:');
      console.log('  node search.js is:unread');
      console.log('  node search.js --from boss@company.com --recent 1d');
      console.log('  node search.js urgent --from support@domain.com');
      process.exit(1);
    }

    const messages = await searchEmails(query, limit);

    console.log(`\n🔍 Found ${messages.length} message${messages.length !== 1 ? 's' : ''} for: "${query}"\n`);

    messages.forEach((msg, idx) => {
      console.log(`${idx + 1}. ${msg.from}`);
      console.log(`   To: ${msg.to}`);
      console.log(`   Subject: ${msg.subject}`);
      console.log(`   Date: ${msg.date}`);
      console.log(`   ID: ${msg.id}`);
      console.log(`   Snippet: ${msg.snippet.substring(0, 100)}...`);
      console.log();
    });

    console.log('--- JSON ---');
    console.log(JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
