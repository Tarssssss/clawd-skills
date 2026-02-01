#!/usr/bin/env node

/**
 * Create a minimal test entry (just title)
 */

const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function createMinimalEntry(databaseId) {
  // First, query to see what properties exist
  const dbInfo = await notion.databases.retrieve({ database_id: databaseId });

  console.log('Database properties:', Object.keys(dbInfo.properties || {}));

  // Create page with minimal properties
  const pageData = {
    parent: {
      database_id: databaseId,
    },
  };

  // Try to find the title property
  const titlePropName = Object.keys(dbInfo.properties || {}).find(
    key => dbInfo.properties[key].type === 'title'
  );

  if (titlePropName) {
    pageData.properties = {
      [titlePropName]: {
        title: [
          {
            text: {
              content: '测试条目 - 今天完成了目标澄清讨论',
            },
          },
        ],
      },
    };
  }

  const response = await notion.pages.create(pageData);

  return response;
}

// CLI
(async () => {
  try {
    const databaseId = process.argv[2] || '2fa8daf1727c80ccb060d231a56723e4';

    console.log('📝 Creating minimal test entry...');
    const entry = await createMinimalEntry(databaseId);

    console.log('✅ Test entry created successfully!');
    console.log(`🆔 Page ID: ${entry.id}`);
    console.log(`🔗 URL: ${entry.url}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
