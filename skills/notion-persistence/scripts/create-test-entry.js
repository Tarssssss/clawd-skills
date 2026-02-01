#!/usr/bin/env node

/**
 * Create a test entry in the time block database
 */

const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function createTestEntry(databaseId) {
  const response = await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties: {
      'Name': {
        title: [
          {
            text: {
              content: '测试条目 - 今天完成了目标澄清讨论',
            },
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
    ],
  });

  return response;
}

// CLI
(async () => {
  try {
    const databaseId = process.argv[2] || '2fa8daf1727c80ccb060d231a56723e4';

    console.log('📝 Creating test entry...');
    const entry = await createTestEntry(databaseId);

    console.log('✅ Test entry created successfully!');
    console.log(`🆔 Page ID: ${entry.id}`);
    console.log(`🔗 URL: ${entry.url}`);
    console.log('\n🎉 Database is ready to use!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
