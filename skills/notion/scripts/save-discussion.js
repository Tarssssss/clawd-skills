#!/usr/bin/env node

/**
 * Save discussion result to Notion and notify Telegram group
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const TELEGRAM_BOT_TOKEN = '8437521570:AAGZQ_oY5twQ_ybhW9qy6FhXYL_4oMbdYEk';
const TELEGRAM_GROUP_ID = '-5079148766';

/**
 * Generate title from discussion content
 */
function generateTitle(content) {
  const lines = content.split('\n');

  // Try to extract from markdown headers
  for (const line of lines) {
    if (line.startsWith('## ')) {
      return line.replace('## ', '').trim();
    }
  }

  // Fallback: use first meaningful line
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('```')) {
      return trimmed.substring(0, 30);
    }
  }

  return '讨论结果';
}

/**
 * Extract summary from content
 */
function extractSummary(content) {
  const lines = content.split('\n');

  // Find first paragraph
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('```') && !trimmed.startsWith('---')) {
      return trimmed.substring(0, 100);
    }
  }

  return '讨论内容...';
}

/**
 * Create Notion page
 */
function createNotionPage({ title, content, date, protocolVersion }) {
  const url = 'https://api.notion.com/v1/pages';

  // Simple content blocks (first paragraph only for now)
  const blocks = [];

  // Parse markdown to blocks
  const lines = content.split('\n');
  let currentText = [];

  for (const line of lines) {
    if (line.startsWith('#')) {
      // Flush current paragraph
      if (currentText.length > 0) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: currentText.join('\n') } }],
          },
        });
        currentText = [];
      }

      // Add heading
      const level = line.match(/^#+/)[0].length;
      const headingType = level <= 3 ? `heading_${level}` : 'heading_3';
      blocks.push({
        object: 'block',
        type: headingType,
        [headingType]: {
          rich_text: [{ type: 'text', text: { content: line.replace(/^#+\s*/, '') } }],
        },
      });
    } else if (line.trim() === '' || line.startsWith('```')) {
      // Skip empty lines and code blocks
      continue;
    } else {
      currentText.push(line);
    }
  }

  // Flush remaining content
  if (currentText.length > 0) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: currentText.join('\n') } }],
      },
    });
  }

  const pageData = {
    parent: {
      database_id: NOTION_DATABASE_ID,
    },
    properties: {
      title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    },
  };

  // Add Date property
  if (date) {
    pageData.properties.Date = {
      date: { start: date },
    };
  }

  // Add Protocol property
  if (protocolVersion) {
    pageData.properties.Protocol = {
      rich_text: [{ type: 'text', text: { content: protocolVersion } }],
    };
  }

  // Add content blocks
  if (blocks.length > 0) {
    pageData.children = blocks;
  }

  try {
    const result = execSync(
      `curl -s -X POST "${url}" -H "Authorization: Bearer ${NOTION_TOKEN}" -H "Content-Type: application/json" -H "Notion-Version: 2022-06-28" -d '${JSON.stringify(pageData)}'`,
      { encoding: 'utf-8' }
    );

    const data = JSON.parse(result);
    if (!data.id) {
      throw new Error('Failed to create page');
    }

    // Get page URL
    const pageId = data.id;
    const urlResult = execSync(
      `curl -s -X POST "https://api.notion.com/v1/pages/${pageId}" -H "Authorization: Bearer ${NOTION_TOKEN}" -H "Notion-Version: 2022-06-28"`,
      { encoding: 'utf-8' }
    );

    const pageDataFull = JSON.parse(urlResult);
    return {
      success: true,
      pageId,
      url: pageDataFull.url,
    };
  } catch (err) {
    console.error('Notion API error:', err.message);
    throw new Error(`Failed to create Notion page: ${err.message}`);
  }
}

/**
 * Send message to Telegram group
 */
function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_GROUP_ID,
    text: message,
    parse_mode: 'Markdown',
  };

  try {
    const result = execSync(
      `curl -s -X POST "${url}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`,
      { encoding: 'utf-8' }
    );

    const response = JSON.parse(result);
    if (!response.ok) {
      throw new Error(response.description || 'Failed to send message');
    }

    return { success: true, messageId: response.result.message_id };
  } catch (err) {
    throw new Error(`Failed to send Telegram message: ${err.message}`);
  }
}

/**
 * Main function
 */
async function saveDiscussionResult({ content, protocolVersion = 'v1.0' }) {
  try {
    console.log('📄 Saving discussion result...');

    // Generate title
    const titleBase = generateTitle(content);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    const title = `${dateStr} ${timeStr} - ${titleBase}`;

    // Extract summary
    const summary = extractSummary(content);

    // Create Notion page
    console.log('📄 Creating Notion page...');
    const notionResult = await createNotionPage({
      title,
      content,
      date: dateStr,
      protocolVersion,
    });

    console.log('✅ Notion page created');
    console.log(`🔗 URL: ${notionResult.url}`);

    // Send summary to Telegram
    console.log('📤 Sending summary to Telegram...');
    const telegramMessage = `✅ 讨论结果已保存到 Notion

标题：${titleBase}
时间：${dateStr} ${timeStr}
链接：${notionResult.url}

摘要：${summary}`;

    const telegramResult = await sendToTelegram(telegramMessage);
    console.log('✅ Telegram message sent');
    console.log(`🆔 Message ID: ${telegramResult.messageId}`);

    return {
      success: true,
      notionUrl: notionResult.url,
      telegramMessageId: telegramResult.messageId,
    };
  } catch (err) {
    console.error('❌ Error:', err.message);
    throw err;
  }
}

// CLI
(async () => {
  try {
    const args = process.argv.slice(2);
    let content = null;
    let protocolVersion = 'v1.0';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--content' && args[i + 1]) {
        content = args[i + 1];
        i++;
      } else if (args[i] === '--protocol' && args[i + 1]) {
        protocolVersion = args[i + 1];
        i++;
      } else if (args[i] === '--content-file' && args[i + 1]) {
        const fs = require('fs');
        content = fs.readFileSync(args[i + 1], 'utf-8');
        i++;
      }
    }

    if (!content) {
      console.log('❌ Error: Missing --content or --content-file');
      console.log('Usage: node save-discussion.js --content "Discussion result" [--protocol v1.0]');
      console.log('       node save-discussion.js --content-file result.md [--protocol v1.0]');
      process.exit(1);
    }

    const result = await saveDiscussionResult({ content, protocolVersion });
    console.log('\n🎉 All done!');
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
})();
