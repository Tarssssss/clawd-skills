/**
 * Send email via Gmail API
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
 * Encode string to base64 for MIME headers
 */
function mimeEncode(str) {
  return Buffer.from(str, 'utf-8').toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Encode subject for proper Unicode support
 */
function encodeSubject(subject) {
  // Check if subject contains non-ASCII characters
  const isNonAscii = /[^\x00-\x7F]/.test(subject);
  if (!isNonAscii) {
    return subject;
  }
  // Use MIME encoded-word format for Unicode
  const encoded = Buffer.from(subject, 'utf-8').toString('base64');
  return `=?UTF-8?B?${encoded}?=`;
}

/**
 * Create email message in RFC 822 format
 */
function createEmail(to, subject, body, from = null) {
  const message = [
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
  ].join('\r\n');

  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendEmail(to, subject, body, from = null) {
  const gmail = await getGmailClient();

  // Get sender email
  if (!from) {
    const profile = await gmail.users.getProfile({ userId: 'me' });
    from = profile.data.emailAddress;
  }

  const raw = createEmail(to, subject, body, from);

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: raw,
    },
  });

  return result.data;
}

// CLI
(async () => {
  try {
    const args = process.argv.slice(2);

    let to = null;
    let subject = null;
    let body = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--to' && args[i + 1]) {
        to = args[i + 1];
        i++;
      } else if (args[i] === '--subject' && args[i + 1]) {
        subject = args[i + 1];
        i++;
      } else if (args[i] === '--body' && args[i + 1]) {
        body = args[i + 1];
        i++;
      } else if (args[i] === '--body-file' && args[i + 1]) {
        body = await fs.readFile(args[i + 1], 'utf-8');
        i++;
      }
    }

    if (!to || !subject || !body) {
      console.log('❌ Error: Missing required arguments\n');
      console.log('Usage: node send.js --to <email> --subject <text> --body <text>');
      console.log('       node send.js --to <email> --subject <text> --body-file <file>');
      console.log('\nExample:');
      console.log('  node send.js --to user@example.com --subject "Hello" --body "World"');
      console.log('  node send.js --to user@example.com --subject "Report" --body-file message.txt');
      process.exit(1);
    }

    console.log('📤 Sending email...');
    const result = await sendEmail(to, subject, body);

    console.log('✅ Email sent successfully!');
    console.log('🆔 Message ID:', result.id);
    console.log('📅 Thread ID:', result.threadId);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
