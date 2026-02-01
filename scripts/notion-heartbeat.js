#!/usr/bin/env node

/**
 * Notion Heartbeat Script
 * Reads daily time block entries and generates daily report
 */

const { execSync, exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');

// Load .env from notion-persistence skill
require('dotenv').config({ path: path.resolve(__dirname, '../skills/notion-persistence/.env') });

const execAsync = promisify(exec);

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.TIME_BLOCK_DATABASE_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_DAILY_REPORT_GROUP_ID = process.env.TELEGRAM_DAILY_REPORT_GROUP_ID;

const HEARTBEAT_STATE_FILE = path.join(process.cwd(), 'memory/heartbeat-state.json');

/**
 * Load last heartbeat timestamp
 */
function loadHeartbeatState() {
  try {
    if (fs.existsSync(HEARTBEAT_STATE_FILE)) {
      const content = fs.readFileSync(HEARTBEAT_STATE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('⚠️  Warning: Failed to load heartbeat state:', err.message);
  }

  return {
    lastHeartbeat: null,
    lastChecks: {
      email: null,
      calendar: null,
      weather: null,
    },
  };
}

/**
 * Save heartbeat timestamp
 */
function saveHeartbeatState(state) {
  try {
    const dir = path.dirname(HEARTBEAT_STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(HEARTBEAT_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('❌ Error: Failed to save heartbeat state:', err.message);
  }
}

/**
 * Query database for new entries
 */
async function queryNewEntries(lastHeartbeat) {
  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

  try {
    const result = execSync(
      `curl -s -X POST "${url}" -H "Authorization: Bearer ${NOTION_TOKEN}" -H "Content-Type: application/json" -H "Notion-Version: 2022-06-28" -d '{}'`,
      { encoding: 'utf-8' }
    );

    const data = JSON.parse(result);

    if (!data.results || !Array.isArray(data.results)) {
      console.error('Invalid data structure:', JSON.stringify(data, null, 2));
      return [];
    }

    // Filter entries after last heartbeat
    if (lastHeartbeat) {
      const lastTime = new Date(lastHeartbeat);
      data.results = data.results.filter(page => {
        const createTime = new Date(page.created_time);
        return createTime > lastTime;
      });
    }

    return data.results;
  } catch (err) {
    throw new Error(`Failed to query database: ${err.message}`);
  }
}

/**
 * Read page content
 */
async function readPageContent(pageId) {
  const url = `https://api.notion.com/v1/blocks/${pageId}/children`;

  try {
    const result = execSync(
      `curl -s "${url}" -H "Authorization: Bearer ${NOTION_TOKEN}" -H "Notion-Version: 2022-06-28"`,
      { encoding: 'utf-8' }
    );

    const data = JSON.parse(result);
    return data.results || [];
  } catch (err) {
    console.error(`⚠️  Warning: Failed to read page ${pageId}:`, err.message);
    return [];
  }
}

/**
 * Extract purpose and action from page content
 */
function extractPageInfo(blocks) {
  let purpose = null;
  let action = null;

  for (const block of blocks) {
    const text = block.paragraph?.rich_text?.map(t => t.text?.content).join('') || '';

    if (text.includes('**目的**')) {
      const match = text.match(/\*\*目的\*\*[:：]\s*(.+)/);
      if (match) {
        purpose = match[1].trim();
      }
    }

    if (text.includes('**具体行动**')) {
      const match = text.match(/\*\*具体行动\*\*[:：]\s*(.+)/);
      if (match) {
        action = match[1].trim();
      }
    }

    if (purpose && action) {
      break;
    }
  }

  return { purpose, action };
}

/**
 * Generate tag for entry based on content
 * Format: 动作类型-细分领域
 */
function generateTag(content, title) {
  const fullText = `${title} ${content}`.toLowerCase();

  // Keywords for different tags
  const tagPatterns = {
    '学习-神经科学': ['神经', '脑', '认知', '心理', '大脑'],
    '学习-AI': ['ai', '人工智能', '机器学习', '深度学习', '模型', '算法', 'pytorch', 'tensorflow'],
    '学习-LBS': ['lbs', '位置服务', '定位', '地图', '地理'],
    '实践-OpenClaw': ['openclaw', 'clawd', '开发', '编程', '代码', '项目'],
  };

  // Find matching tags
  const matchedTags = [];
  for (const [tag, keywords] of Object.entries(tagPatterns)) {
    if (keywords.some(kw => fullText.includes(kw))) {
      matchedTags.push(tag);
    }
  }

  // If no match, return default
  return matchedTags.length > 0 ? matchedTags[0] : '学习-其他';
}

/**
 * Update page tags
 */
async function updatePageTags(pageId, tags) {
  const url = `https://api.notion.com/v1/pages/${pageId}`;

  const pageData = {
    properties: {
      'Tags': {
        multi_select: tags.map(tag => ({ name: tag })),
      },
    },
  };

  try {
    const result = execSync(
      `curl -s -X PATCH "${url}" -H "Authorization: Bearer ${NOTION_TOKEN}" -H "Content-Type: application/json" -H "Notion-Version: 2022-06-28" -d '${JSON.stringify(pageData)}'`,
      { encoding: 'utf-8' }
    );

    const data = JSON.parse(result);
    console.log(`✅ Updated tags for page ${pageId}: ${tags.join(', ')}`);
    return data;
  } catch (err) {
    console.error(`⚠️  Warning: Failed to update tags for page ${pageId}:`, err.message);
  }
}

/**
 * Generate daily report
 */
function generateDailyReport(entries) {
  if (entries.length === 0) {
    return null;
  }

  // Group by tags
  const grouped = {};
  for (const entry of entries) {
    const tags = entry.tags || [];
    const primaryTag = tags[0] || '未分类';

    if (!grouped[primaryTag]) {
      grouped[primaryTag] = [];
    }

    grouped[primaryTag].push(entry);
  }

  // Generate report
  const dateStr = new Date().toISOString().slice(0, 10);
  let report = `📅 ${dateStr} 日报\n\n`;
  report += `今天完成了 ${entries.length} 件事，集中在 [${Object.keys(grouped).join('], [')}] 方向：\n\n`;

  for (const [tag, tagEntries] of Object.entries(grouped)) {
    for (const entry of tagEntries) {
      report += `1. ${tag}：${entry.title}\n`;
      report += `   目的：${entry.purpose || '未记录'}\n`;
      report += `   具体行动：${entry.action || '未记录'}\n\n`;
    }
  }

  return report;
}

/**
 * Send daily report to Telegram
 */
async function sendDailyReport(report) {
  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_DAILY_REPORT_GROUP_ID,
    text: report,
    parse_mode: 'Markdown',
  };

  try {
    const { stdout, stderr } = await execAsync(
      `curl -s -X POST "${apiUrl}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`,
      { encoding: 'utf-8', shell: '/bin/bash' }
    );

    const response = JSON.parse(stdout || stderr || '{}');
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
 * Main heartbeat function
 */
async function heartbeat() {
  try {
    console.log('📊 Notion Heartbeat started...\n');

    // Load last heartbeat timestamp
    const state = loadHeartbeatState();
    const lastHeartbeat = state.lastHeartbeat;
    console.log(`📅 Last heartbeat: ${lastHeartbeat || 'Never'}`);

    // Query new entries
    console.log('📋 Querying new entries...');
    const newEntries = await queryNewEntries(lastHeartbeat);
    console.log(`✅ Found ${newEntries.length} new entries\n`);

    if (newEntries.length === 0) {
      console.log('ℹ️  No new entries since last heartbeat');
      return;
    }

    // Process each entry
    const processedEntries = [];
    for (const page of newEntries) {
      const pageId = page.id;
      const title = page.properties.Title?.title[0]?.text?.content || '(no title)';
      const date = page.properties.Date?.date?.start || '(no date)';
      const timeBlock = page.properties['Time Block']?.rich_text[0]?.text?.content || '(no time)';
      const tags = page.properties.Tags?.multi_select?.map(t => t.name) || [];

      console.log(`\n📄 Processing: ${title}`);
      console.log(`    Date: ${date}, Time: ${timeBlock}`);
      console.log(`    Current tags: ${tags.join(', ') || '(none)'}`);

      // Read page content
      const blocks = await readPageContent(pageId);
      const { purpose, action } = extractPageInfo(blocks);

      console.log(`    Purpose: ${purpose || '(not found)'}`);
      console.log(`    Action: ${action || '(not found)'}`);

      // Auto-fill tags if empty
      if (tags.length === 0) {
        const contentText = blocks.map(b => b.paragraph?.rich_text?.map(t => t.text?.content).join('') || '').join(' ');
        const generatedTag = generateTag(contentText, title);

        console.log(`    🏷️  Auto-filling tag: ${generatedTag}`);
        await updatePageTags(pageId, [generatedTag]);

        // Update entry with new tag
        processedEntries.push({
          title,
          date,
          timeBlock,
          purpose,
          action,
          tags: [generatedTag],
        });
      } else {
        processedEntries.push({
          title,
          date,
          timeBlock,
          purpose,
          action,
          tags,
        });
      }
    }

    // Generate daily report
    console.log('\n📊 Generating daily report...');
    const report = generateDailyReport(processedEntries);

    if (!report) {
      console.log('ℹ️  No report to generate');
      return;
    }

    console.log(report);

    // Send to Telegram
    console.log('\n📤 Sending daily report to Telegram...');
    const telegramResult = await sendDailyReport(report);
    console.log(`✅ Message sent (ID: ${telegramResult.messageId})`);

    // Update heartbeat state
    const now = new Date().toISOString();
    saveHeartbeatState({
      ...state,
      lastHeartbeat: now,
    });

    console.log(`\n✅ Heartbeat completed! Next check: ${now}`);
  } catch (err) {
    console.error('\n❌ Heartbeat failed:', err.message);
    throw err;
  }
}

// CLI
(async () => {
  try {
    await heartbeat();
  } catch (err) {
    process.exit(1);
  }
})();
