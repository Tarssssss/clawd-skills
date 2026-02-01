#!/usr/bin/env node

/**
 * Create a Notion Database for daily time block tracking
 */

const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function createTimeBlockDatabase(parentPageId) {
  const response = await notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: parentPageId,
    },
    icon: {
      emoji: '📋',
    },
    title: [
      {
        type: 'text',
        text: {
          content: '日常学习与工作记录',
        },
      },
    ],
    properties: {
      'Date': {
        type: 'date',
        date: {},
      },
      'TimeRange': {
        type: 'text',
        text: {},
      },
      'Title': {
        type: 'title',
        title: {},
      },
      'Tags': {
        type: 'multi_select',
        multi_select: {
          options: [
            {
              name: '学习-神经科学',
              color: 'red',
            },
            {
              name: '学习-AI',
              color: 'blue',
            },
            {
              name: '学习-LBS',
              color: 'green',
            },
            {
              name: '实践-OpenClaw',
              color: 'orange',
            },
          ],
        },
      },
    },
  });

  return response;
}

// CLI
(async () => {
  try {
    const parentId = process.env.NOTION_PARENT_ID || process.argv[2];

    if (!parentId) {
      console.log('❌ Error: Missing parent page ID');
      console.log('Usage: node create-database.js <parent_page_id>');
      console.log('Or set NOTION_PARENT_ID in .env file');
      process.exit(1);
    }

    console.log('📊 Creating Notion database...');
    const database = await createTimeBlockDatabase(parentId);

    console.log('✅ Database created successfully!');
    console.log(`🆔 Database ID: ${database.id}`);
    console.log(`🔗 URL: ${database.url}`);
    console.log('\n📝 Database structure:');
    console.log('- 日期 (Date)');
    console.log('- 时间段 (Text)');
    console.log('- 简短标题 (Title)');
    console.log('- 主题标签 (Multi-select)');
    console.log('\n预设标签选项:');
    database.properties['主题标签'].multi_select.options.forEach(option => {
      console.log(`  - ${option.name}`);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.code === 'object_not_found') {
      console.error('Parent page not found. Please check NOTION_PARENT_ID.');
    } else if (err.code === 'unauthorized') {
      console.error('Unauthorized. Please check NOTION_TOKEN.');
    }
    process.exit(1);
  }
})();
