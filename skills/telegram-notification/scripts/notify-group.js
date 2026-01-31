#!/usr/bin/env node

/**
 * Send notification to Telegram groups with flexible routing
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8437521570:AAGZQ_oY5twQ_ybhW9qy6FhXYL_4oMbdYEk';
const TELEGRAM_DISCUSSION_GROUP_ID = process.env.TELEGRAM_DISCUSSION_GROUP_ID;
const TELEGRAM_GENERAL_GROUP_ID = process.env.TELEGRAM_GENERAL_GROUP_ID;

/**
 * Determine target group based on options
 */
function getTargetGroupId(options) {
  const { target, chatId } = options;

  // Priority 1: Explicit chat ID (highest priority)
  if (chatId) {
    return chatId;
  }

  // Priority 2: Target option
  if (target === 'discussion') {
    if (!TELEGRAM_DISCUSSION_GROUP_ID) {
      throw new Error('TELEGRAM_DISCUSSION_GROUP_ID not configured in .env');
    }
    return TELEGRAM_DISCUSSION_GROUP_ID;
  }

  if (target === 'general') {
    if (!TELEGRAM_GENERAL_GROUP_ID) {
      throw new Error('TELEGRAM_GENERAL_GROUP_ID not configured in .env');
    }
    return TELEGRAM_GENERAL_GROUP_ID;
  }

  // Priority 3: Fallback to discussion group
  if (TELEGRAM_DISCUSSION_GROUP_ID) {
    return TELEGRAM_DISCUSSION_GROUP_ID;
  }

  throw new Error('No target group configured. Set TELEGRAM_DISCUSSION_GROUP_ID in .env');
}

/**
 * Send message to Telegram group
 */
function sendToTelegram(options) {
  const { chatId, title, url, summary, message } = options;

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
    chat_id: chatId,
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
    let target = null;
    let chatId = null;
    let title = null;
    let url = null;
    let summary = null;
    let message = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--target' && args[i + 1]) {
        target = args[i + 1];
        i++;
      } else if (args[i] === '--chat-id' && args[i + 1]) {
        chatId = args[i + 1];
        i++;
      } else if (args[i] === '--title' && args[i + 1]) {
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

    // Determine target group
    const targetGroupId = getTargetGroupId({ target, chatId });

    // Validation
    if (message) {
      // Custom message mode, no other fields needed
    } else if (!title || !url) {
      console.log('❌ Error: Missing required options');
      console.log('Usage: node notify-group.js --target <discussion|general> --title "Title" --url "URL" [--summary "Summary"]');
      console.log('       node notify-group.js --target general --message "Custom message"');
      console.log('       node notify-group.js --chat-id -100xxx --message "Custom message"');
      process.exit(1);
    }

    console.log(`📤 Sending to Telegram group (target: ${target || 'default'}, chat_id: ${targetGroupId})...`);
    const result = sendToTelegram({ chatId: targetGroupId, title, url, summary, message });
    console.log('✅ Message sent successfully!');
    console.log(`🆔 Message ID: ${result.messageId}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
