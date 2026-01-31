/**
 * Get full Gmail message content
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

/**
 * Extract plain text or HTML from message payload
 */
function extractBody(payload) {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.mimeType === 'text/html' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
  }

  return '';
}

async function getMessage(messageId) {
  const gmail = await getGmailClient();

  const message = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const headers = message.data.payload.headers.reduce((acc, h) => {
    acc[h.name] = h.value;
    return acc;
  }, {});

  const body = extractBody(message.data.payload);

  return {
    id: message.data.id,
    threadId: message.data.threadId,
    from: headers['From'] || 'Unknown',
    to: headers['To'] || 'Unknown',
    cc: headers['Cc'] || '',
    subject: headers['Subject'] || '(No subject)',
    date: headers['Date'] || '',
    body: body,
    snippet: message.data.snippet || '',
  };
}

// CLI
(async () => {
  try {
    const messageId = process.argv[2];

    if (!messageId) {
      console.log('❌ Error: Please provide a message ID\n');
      console.log('Usage: node get.js <message-id>');
      console.log('\nGet message ID from: node check.js or node search.js');
      process.exit(1);
    }

    const message = await getMessage(messageId);

    console.log('\n' + '='.repeat(60));
    console.log('📧 From:', message.from);
    console.log('📨 To:', message.to);
    if (message.cc) console.log('📋 Cc:', message.cc);
    console.log('📅 Date:', message.date);
    console.log('📝 Subject:', message.subject);
    console.log('🆔 ID:', message.id);
    console.log('='.repeat(60));
    console.log('\n' + message.body);
    console.log('\n' + '='.repeat(60));

    console.log('\n--- JSON ---');
    console.log(JSON.stringify(message, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
