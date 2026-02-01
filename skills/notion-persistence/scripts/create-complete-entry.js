#!/usr/bin/env node

/**
 * Create a complete test entry with page content
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;

async function createCompleteEntry(databaseId) {
  const url = 'https://api.notion.com/v1/pages';

  const pageData = {
    parent: {
      database_id: databaseId,
    },
    properties: {
      'Title': {
        title: [
          {
            text: {
              content: '测试条目 - 今天完成了目标澄清讨论',
            },
          },
        ],
      },
      'Date': {
        date: {
          start: '2026-02-02',
        },
      },
      'Time Block': {
        rich_text: [
          {
            type: 'text',
            text: {
              content: '0900-1000#1',
            },
          },
        ],
      },
      'Tags': {
        multi_select: [
          {
            name: '学习-AI',
          },
        ],
      },
    },
    children: [
      {
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: '📋 基本信息' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: '**目的**：明确学习工作管理方案' },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: '**具体行动**：完成数据库设计和 heartbeat 机制讨论' },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: '📝 详细内容' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: '今天通过目标澄清讨论，确定了以下方案：' },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: '1. Notion database 作为中心站点存储记录' },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: '2. AI 自动填充主题标签' },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: '3. Heartbeat 每日生成并发送日报到 Telegram' },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: '🔗 参考资料' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '飞书文档：https://my.feishu.cn/wiki/PvAjwNET8iNu9MkqbgAcYoQNn0b',
                link: {
                  url: 'https://my.feishu.cn/wiki/PvAjwNET8iNu9MkqbgAcYoQNn0b',
                },
              },
            },
          ],
        },
      },
    ],
  };

  try {
    const result = execSync(
      `curl -s -X POST "${url}" -H "Authorization: Bearer ${NOTION_TOKEN}" -H "Content-Type: application/json" -H "Notion-Version: 2022-06-28" -d '${JSON.stringify(pageData)}'`,
      { encoding: 'utf-8' }
    );

    const data = JSON.parse(result);
    if (!data.id) {
      throw new Error('Failed to create page');
    }

    return data;
  } catch (err) {
    throw new Error(`Failed to create page: ${err.message}`);
  }
}

// CLI
(async () => {
  try {
    const databaseId = process.argv[2] || '2fa8daf1727c80929790e2e9a276371d';

    console.log('📝 Creating complete test entry...');
    const page = await createCompleteEntry(databaseId);

    console.log('✅ Test entry created successfully!');
    console.log(`🆔 Page ID: ${page.id}`);
    console.log(`🔗 URL: ${page.url}`);
    console.log('\n🎉 Database is fully ready to use!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
})();
