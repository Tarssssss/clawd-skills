#!/usr/bin/env node

/**
 * Send notification to Telegram group
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8437521570:AAGZQ_oY5twQ_ybhW9qy6FhXYL_4oMbdYEk';
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID || '-5079148766';

/**
 * Send message to Telegram group
 */
function sendToTelegram(options) {
  const { title, url, summary, message } = options;

  let text;

  if (message) {
    // Custom message
    text = message;
  } else {
    // Discussion summary format
    text = `✅ 讨论结果已保存到 Notion

标题：${title}
链接：${url}${summary ? `\n\n摘要：${summary}` : ''}`;
  }

  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_GROUP_ID,
    text: text,
    parse_mode: 'Markdown',
  };

  try {
    const result = require('child_process').execSync(
      `curl -s -X POST "${apiUrl}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`,
      { encoding: 'utf-8' }
    );

    const response = JSON.parse(result);
    if (!response.ok) {
      throw new Error(response.description || 'Failed to send message');
    }

    return {
      success: true,
      messageId: response.result.message_id,
    };
  } catch (err) {
    throw new Error(`Failed to send Telegram message: ${err.message}`);
  }
}

// CLI
(() => {
  try {
    const args = process.argv.slice(2);
    let title = null;
    let url = null;
    let summary = null;
    let message = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--title' && args[i + 1]) {
        title = args[i + 1];
        i++;
      } else if (args[i] === '--url' && args[i + 1]) {
        url = args[i + 1];
        i++;
      } else if (args[i] === '--summary' && args[i + 1]) {
        summary = args[i + 1];
        i++;
      } else if (args[i] === '--message' && args[i + 1]) {
        message = args[i + 1];
        i++;
      }
    }

    // Validation
    if (message) {
      // Custom message mode, no other fields needed
    } else if (!title || !url) {
      console.log('❌ Error: Missing required options');
      console.log('Usage: node notify-group.js --title "Title" --url "URL" [--summary "Summary"]');
      console.log('       node notify-group.js --message "Custom message"');
      process.exit(1);
    }

    console.log('📤 Sending to Telegram...');
    const result = sendToTelegram({ title, url, summary, message });
    console.log('✅ Message sent successfully!');
    console.log(`🆔 Message ID: ${result.messageId}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
