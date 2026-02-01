#!/usr/bin/env node

/**
 * Query a Notion Database to verify structure
 */

const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function queryDatabase(databaseId) {
  const response = await notion.databases.retrieve({ database_id: databaseId });

  return response;
}

// CLI
(async () => {
  try {
    const databaseId = process.argv[2] || 'd7a9d682-1ecc-4448-88bf-8b4632a858ae';

    console.log('📊 Querying Notion database...');
    const database = await queryDatabase(databaseId);

    console.log('✅ Database retrieved successfully!');
    console.log(`🆔 Database ID: ${database.id}`);
    console.log(`🔗 URL: ${database.url}`);
    console.log(`📛 Title: ${database.title[0].plain_text}`);
    console.log('\n📝 Database properties:');

    if (database.properties) {
      for (const [key, property] of Object.entries(database.properties)) {
        console.log(`\n  ${key} (${property.type}):`);
        if (property.type === 'multi_select') {
          console.log(`    Options: ${property.multi_select.options.map(opt => opt.name).join(', ')}`);
        }
      }
    } else {
      console.log('  No properties found');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
