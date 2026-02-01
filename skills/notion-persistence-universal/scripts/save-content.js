#!/usr/bin/env node

/**
 * Universal Notion Saver
 * 一旦配置，未来新增任何类型都不需要修改代码
 * 只需通过 CLI 传入类型名称即可
 *
 * 使用方式：
 * 1. 完整配置（推荐，未来新增类型使用此方式）：
 *    node save-content.js --type meeting_summary --database-id xxx --telegram-target xxx --properties '{...}'
 *
 * 2. 配置名称（已配置的类型）：
 *    node save-content.js --type discussion --properties '{...}'
 *
 * 3. 向后兼容（legacy，从旧版 .env 读取）：
 *    node save-content.js --target discussion --properties '{...}'
 */

const { execSync, exec } = require('child_process');
const path = require('path');
const { generateTitle, extractSummary, extractBackground } = require('./utils.js');
const { promisify } = require('util');
const execAsync = promisify(exec);
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8437521570:AAGZQ_oY5twQ_ybhW9qy6FhXYL_4oMbdYEk';

/**
 * Get type configuration from CLI parameters
 * 支持 3 种传入方式（优先级从高到低）：
 * 1. 完整配置：--type, --database-id, --telegram-target（最灵活，未来新增类型使用）
 * 2. 配置名称：--type（从 .env 读取 NOTION_DB_{TYPE} 和 TELEGRAM_{TYPE}_GROUP_ID）
 * 3. 向后兼容：--target（从 legacy .env 读取，支持旧版调用）
 */
function getTypeConfig(params) {
  const { type, databaseId, telegramTarget, target } = params;

  // 优先级 1：完整配置（最灵活，未来新增类型使用此方式）
  if (type && databaseId && telegramTarget) {
    return {
      type,
      databaseId,
      telegramTarget,
      source: 'full-config',
    };
  }

  // 优先级 2：配置名称（从 .env 读取）
  if (type) {
    const dbId = process.env[`NOTION_DB_${type.toUpperCase()}`];
    const tgTarget = process.env[`TELEGRAM_${type.toUpperCase()}_GROUP_ID`] ||
                   process.env[`TELEGRAM_${type.toUpperCase()}_TARGET`];

    if (dbId) {
      return {
        type,
        databaseId: dbId,
        telegramTarget: tgTarget || target,
        source: 'env-config',
      };
    }
  }

  // 优先级 3：向后兼容（从 legacy .env 读取，支持旧版调用）
  if (target) {
    const legacyDbIds = {
      discussion: process.env.NOTION_DB_DISCUSSION,
      daily_report: process.env.NOTION_DB_DAILY_REPORT,
    };

    const legacyTgTargets = {
      discussion: process.env.TELEGRAM_DISCUSSION_GROUP_ID,
      daily_report: process.env.TELEGRAM_DAILY_REPORT_GROUP_ID,
    };

    if (legacyDbIds[target]) {
      return {
        type: target,
        databaseId: legacyDbIds[target],
        telegramTarget: legacyTgTargets[target],
        source: 'legacy',
      };
    }
  }

  throw new Error(`无法获取类型配置。请提供：\n` +
    `  1. 完整配置：--type <name> --database-id <id> --telegram-target <target>（推荐，未来新增类型）\n` +
    `  2. 配置名称：--type <name>（需在 .env 中配置 NOTION_DB_<TYPE> 和 TELEGRAM_<TYPE>_GROUP_ID）\n` +
    `  3. 向后兼容：--target <discussion|daily_report>（支持旧版调用）`);
}

/**
 * Create Notion page with external properties
 * Properties 完全由调用方定义，skill 只负责保存
 */
function createNotionPage({ title, content, date, protocolVersion, databaseId, properties }) {
  const url = 'https://api.notion.com/v1/pages';

  // Parse markdown to blocks
  const blocks = parseMarkdownToBlocks(content);

  // Build page data
  const pageData = {
    parent: {
      database_id: databaseId,
    },
    properties: properties || {},
    children: blocks,
  };

  // Create page
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
    `curl -s "https://api.notion.com/v1/pages/${pageId}" -H "Authorization: Bearer ${NOTION_TOKEN}" -H "Notion-Version: 2022-06-28"`,
    { encoding: 'utf-8' }
  );

  const pageDataFull = JSON.parse(urlResult);
  return {
    success: true,
    pageId,
    url: pageDataFull.url,
  };
}

/**
 * Parse markdown to Notion blocks
 */
function parseMarkdownToBlocks(content) {
  const blocks = [];
  const lines = content.split('\n');
  let currentText = [];

  for (const line of lines) {
    if (line.startsWith('#')) {
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
      continue;
    } else {
      currentText.push(line);
    }
  }

  if (currentText.length > 0) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: currentText.join('\n') } }],
      },
    });
  }

  return blocks;
}

/**
 * Send notification to Telegram
 */
async function sendToTelegram({ title, url, summary, telegramTarget }) {
  const chatId = telegramTarget;

  if (!chatId) {
    console.warn('⚠️  Warning: Telegram target not specified, skipping notification');
    return { success: true, skipped: true };
  }

  const text = `✅ 内容已保存到 Notion

标题：${title}
链接：${url}${summary ? `\n\n摘要：${summary}` : ''}`;

  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
  };

  try {
    const { stdout } = await execAsync(
      `curl -s -X POST "${apiUrl}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`,
      { encoding: 'utf-8', shell: '/bin/bash' }
    );

    const response = JSON.parse(stdout || '{}');
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

/**
 * Main function
 */
async function saveContent(params) {
  try {
    console.log('📄 Saving content to Notion...\n');

    // Get type configuration
    const typeConfig = getTypeConfig(params);
    console.log(`📊 Type: ${typeConfig.type}`);
    console.log(`📊 Config Source: ${typeConfig.source}`);
    console.log(`🗄️  Database ID: ${typeConfig.databaseId}`);
    console.log(`📤 Telegram Target: ${typeConfig.telegramTarget || '(none)'}\n`);

    // Generate title
    const titleBase = generateTitle(params.content);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    const title = `${dateStr} ${timeStr} - ${titleBase}`;

    // Extract summary
    const summary = extractSummary(params.content);

    // Create Notion page
    console.log('📄 Creating Notion page...');
    const notionResult = await createNotionPage({
      title,
      content: params.content,
      date: params.date || dateStr,
      protocolVersion: params.protocolVersion,
      databaseId: typeConfig.databaseId,
      properties: params.properties,
    });

    console.log('✅ Notion page created');
    console.log(`🔗 URL: ${notionResult.url}\n`);

    // Send to Telegram
    let telegramResult = null;
    if (typeConfig.telegramTarget) {
      console.log('📤 Sending summary to Telegram...');
      telegramResult = await sendToTelegram({
        title: titleBase,
        url: notionResult.url,
        summary,
        telegramTarget: typeConfig.telegramTarget,
      });

      if (!telegramResult.skipped) {
        console.log('✅ Telegram message sent');
        console.log(`🆔 Message ID: ${telegramResult.messageId}\n`);
      }
    }

    return {
      success: true,
      notionUrl: notionResult.url,
      telegramMessageId: telegramResult?.messageId,
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
    let date = null;
    let type = null;
    let databaseId = null;
    let telegramTarget = null;
    let target = null; // Legacy
    let properties = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--content' && args[i + 1]) {
        content = args[i + 1];
        i++;
      } else if (args[i] === '--content-file' && args[i + 1]) {
        const fs = require('fs');
        content = fs.readFileSync(args[i + 1], 'utf-8');
        i++;
      } else if (args[i] === '--protocol' && args[i + 1]) {
        protocolVersion = args[i + 1];
        i++;
      } else if (args[i] === '--date' && args[i + 1]) {
        date = args[i + 1];
        i++;
      } else if (args[i] === '--type' && args[i + 1]) {
        type = args[i + 1];
        i++;
      } else if (args[i] === '--database-id' && args[i + 1]) {
        databaseId = args[i + 1];
        i++;
      } else if (args[i] === '--telegram-target' && args[i + 1]) {
        telegramTarget = args[i + 1];
        i++;
      } else if (args[i] === '--target' && args[i + 1]) {
        target = args[i + 1];
        i++;
      } else if (args[i] === '--properties' && args[i + 1]) {
        try {
          properties = JSON.parse(args[i + 1]);
        } catch (e) {
          console.error('❌ Error: Invalid JSON for --properties');
          process.exit(1);
        }
        i++;
      }
    }

    if (!content) {
      console.log('❌ Error: Missing --content or --content-file\n');
      console.log('用法：\n');
      console.log('1. 完整配置（推荐，未来新增类型使用此方式）：');
      console.log('   node save-content.js --content-file xxx.md --type meeting_summary --database-id xxx --telegram-target xxx --properties \'{...}\'\n');
      console.log('2. 配置名称（已配置的类型）：');
      console.log('   node save-content.js --content-file xxx.md --type discussion --properties \'{...}\'\n');
      console.log('3. 向后兼容（支持旧版调用）：');
      console.log('   node save-content.js --content-file xxx.md --target discussion --properties \'{...}\'\n');
      process.exit(1);
    }

    const result = await saveContent({
      content,
      protocolVersion,
      date,
      type,
      databaseId,
      telegramTarget,
      target,
      properties,
    });

    console.log('🎉 All done!\n');
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
})();
