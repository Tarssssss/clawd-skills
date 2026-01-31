#!/usr/bin/env node

/**
 * Read Apple Notes/Memo data using AppleScript
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const EXPORT_FORMAT = process.env.EXPORT_FORMAT || 'markdown';
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8437521570:AAGZQ_oY5twQ_ybhW9qy6FhXYL_4oMbdYEk';
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

/**
 * Run AppleScript to read Notes/Memo
 */
function readNotesViaAppleScript(memoName) {
  let script;

  if (memoName) {
    // Read specific memo/reminder
    script = `
      tell application "Notes"
        launch
        activate
      end tell
      tell application "System Events"
        set theFolder to "备忘录" of folder "系统事件"
      end tell
    `;
  } else {
    // Read all notes/memos
    script = `
      tell application "Notes"
        activate
      end tell
    `;
  }

  try {
    const result = execSync(
      `osascript -e '${script}'`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data) {
  const lines = data.split('\n');
  let output = [];

  output.push(`# 📝 Apple Notes/Memo 导出`);
  output.push(`\n导出时间：${new Date().toISOString()}\n`);

  let currentItem = null;
  let currentContent = [];

  for (const line of lines) {
    if (line.startsWith('标题：')) {
      if (currentItem) {
        currentItem.content = currentContent.join('\n');
        output.push(formatItem(currentItem));
      }
      currentItem = { title: line.substring(3).trim() };
      currentContent = [];
    } else if (line.startsWith('内容：')) {
      currentContent.push(line.substring(3).trim());
    } else if (line.trim() === '') {
      if (currentItem) {
        currentItem.content = currentContent.join('\n');
        output.push(formatItem(currentItem));
        currentItem = null;
        currentContent = [];
      }
    }
  }

  // Last item
  if (currentItem) {
    currentItem.content = currentContent.join('\n');
    output.push(formatItem(currentItem));
  }

  return output.join('\n\n');
}

/**
 * Format item as Markdown
 */
function formatItem(item) {
  return `## ${item.title}

${item.content}
`;
}

/**
 * Format data as JSON
 */
function formatAsJSON(data) {
  const lines = data.split('\n');
  const items = [];

  let currentItem = null;
  let currentContent = [];

  for (const line of lines) {
    if (line.startsWith('标题：')) {
      if (currentItem) {
        currentItem.content = currentContent.join('\n');
        items.push(currentItem);
      }
      currentItem = { title: line.substring(3).trim() };
      currentContent = [];
    } else if (line.startsWith('内容：')) {
      currentContent.push(line.substring(3).trim());
    } else if (line.trim() === '') {
      if (currentItem) {
        currentItem.content = currentContent.join('\n');
        items.push(currentItem);
        currentItem = null;
        currentContent = [];
      }
    }
  }

  if (currentItem) {
    currentItem.content = currentContent.join('\n');
    items.push(currentItem);
  }

  return JSON.stringify({
    memo_name: 'My Notes',
    export_time: new Date().toISOString(),
    items: items.map(item => ({
      type: 'note',
      title: item.title,
      content: item.content,
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),
    })),
  }, null, 2);
}

/**
 * Save to Notion (using notion-persistence skill)
 */
function saveToNotion(content) {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    console.log('⚠️  Notion configuration not found, skipping...');
    return { success: false };
  }

  try {
    const notionSkillPath = path.resolve(__dirname, '../notion-persistence/scripts/save-discussion.js');

    const result = execSync(
      `node "${notionSkillPath}" --content '${content}'`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    const data = JSON.parse(result);
    if (!data.success) {
      throw new Error(data.error || 'Failed to save to Notion');
    }

    return { success: true, notionUrl: data.notionUrl };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send to Telegram (using telegram-notification skill)
 */
function sendToTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_GROUP_ID) {
    console.log('⚠️  Telegram configuration not found, skipping...');
    return { success: false };
  }

  try {
    const telegramSkillPath = path.resolve(__dirname, '../telegram-notification/scripts/notify-group.js');

    const target = process.env.TELEGRAM_TARGET_DISCUSSION ? 'discussion' : 'github';

    const result = execSync(
      `node "${telegramSkillPath}" --target ${target} --message '${message}'`,
      { encoding: 'utf-8', timeout: 10000 }
    );

    const data = JSON.parse(result);
    if (!data.success) {
      throw new Error(data.error || 'Failed to send to Telegram');
    }

    return { success: true, messageId: data.messageId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Main function
async function readMemo(options) {
  try {
    console.log('🍎 开始读取 Apple Notes/Memo...');

    const { memoName, saveNotion: saveN, sendTelegram: sendT } = options;

    // Read from Apple Notes/Memo
    console.log('📖 通过 AppleScript 读取...');
    const { success, data, error } = readNotesViaAppleScript(memoName);

    if (!success) {
      throw new Error(`Failed to read Notes/Memo: ${error}`);
    }

    console.log('✅ 读取成功');
    console.log(`\n${data}\n`);

    // Format output
    let output;
    if (EXPORT_FORMAT === 'json') {
      output = formatAsJSON(data);
    } else {
      output = formatAsMarkdown(data);
    }

    // Save to Notion
    if (saveN) {
      console.log('📄 保存到 Notion...');
      const result = saveToNotion(output);
      if (result.success) {
        console.log(`✅ Notion 页面创建成功！URL: ${result.notionUrl}`);
        output += `\n\n🔗 Notion URL: ${result.notionUrl}`;
      } else {
        console.log(`⚠️ 保存到 Notion 失败：${result.error}`);
      }
    }

    // Send to Telegram
    if (sendT) {
      console.log('📤 发送到 Telegram...');
      const result = sendToTelegram(`🍎 Apple Notes/Memo 导出\n\n${output}`);
      if (result.success) {
        console.log(`✅ Telegram 消息发送成功！ID: ${result.messageId}`);
      } else {
        console.log(`⚠️ 发送到 Telegram 失败：${result.error}`);
      }
    }

    console.log('\n🎉 完成！');
    return { success: true, output };
  } catch (err) {
    console.error('❌ 错误:', err.message);
    return { success: false, error: err.message };
  }
}

// CLI
(async () => {
  try {
    const args = process.argv.slice(2);
    let memoName = null;
    let saveNotion = false;
    let sendTelegram = false;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--memo-name' && args[i + 1]) {
        memoName = args[i + 1];
        i++;
      } else if (args[i] === '--save-notion') {
        saveNotion = true;
      } else if (args[i] === '--send-telegram') {
        sendTelegram = true;
      }
    }

    const result = await readMemo({ memoName, saveNotion, sendTelegram });

    if (!result.success) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
})();
