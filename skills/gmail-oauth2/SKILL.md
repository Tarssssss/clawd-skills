---
name: gmail-oauth2
description: Gmail OAuth2 access without app passwords. Check, search, read, and send Gmail messages using OAuth2 authentication.
---

# Gmail OAuth2 Access

Access Gmail via OAuth2 without needing app passwords. Supports checking unread emails, searching messages, reading full content, and sending emails.

## Quick Commands

### Check Unread Emails
```bash
node /root/clawd/skills/gmail-oauth2/scripts/check.js [--limit <n>] [--recent <time>]
```

Examples:
- `node check.js` - Check latest 10 unread emails
- `node check.js --limit 5` - Check latest 5 unread emails
- `node check.js --recent 2h` - Check emails from last 2 hours

### Search Emails
```bash
node /root/clawd/skills/gmail-oauth2/scripts/search.js <query> [--limit <n>] [--from <email>] [--subject <text>] [--recent <time>]
```

Examples:
- `node search.js is:unread` - Search all unread
- `node search.js --from boss@company.com` - Search from specific sender
- `node search.js urgent --recent 1d` - Search for "urgent" in last day

### Read Email Content
```bash
node /root/clawd/skills/gmail-oauth2/scripts/get.js <message-id>
```

Get message ID from `check.js` or `search.js` output.

### Send Email
```bash
node /root/clawd/skills/gmail-oauth2/scripts/send.js --to <email> --subject <text> --body <text>
```

Examples:
- `node send.js --to user@example.com --subject "Hello" --body "World"`
- `node send.js --to user@example.com --subject "Report" --body-file message.txt`

## Configuration

Credentials are stored in `.env`:
- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth client secret

Tokens are stored in `scripts/gmail-tokens.json` after first authorization.

## Re-authorize

If tokens expire or become invalid:
```bash
rm /root/clawd/skills/gmail-oauth2/scripts/gmail-tokens.json
node /root/clawd/skills/gmail-oauth2/scripts/auth.js
```

## Setup Reference

1. Create OAuth client at https://console.cloud.google.com/apis/credentials
   - Type: Web application
   - Add redirect URI: `http://127.0.0.1:3000`
2. Enable Gmail API at https://console.developers.google.com/apis/api/gmail.googleapis.com/overview
3. Add test users if in testing mode

## Usage Notes

- Tokens include refresh_token for automatic renewal
- googleapis library handles token refresh automatically
- Credentials are stored locally, never uploaded
