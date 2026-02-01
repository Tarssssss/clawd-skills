#!/usr/bin/env node

/**
 * Query a Notion Database and output full JSON
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
    const databaseId = process.argv[2] || '2fa8daf1727c80ccb060d231a56723e4';

    console.log('📊 Querying Notion database...');
    const database = await queryDatabase(databaseId);

    console.log('\n📋 Full database JSON:');
    console.log(JSON.stringify(database, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
