#!/usr/bin/env node

/**
 * Query entries in the database
 */

const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function queryEntries(databaseId) {
  const response = await notion.databases.query({
    database_id: databaseId,
  });

  return response;
}

// CLI
(async () => {
  try {
    const databaseId = process.argv[2] || '2fa8daf1727c80ccb060d231a56723e4';

    console.log('📊 Querying database entries...');
    const result = await queryEntries(databaseId);

    console.log(`✅ Found ${result.results.length} entries`);
    console.log('\n📋 Entry structure:');
    if (result.results.length > 0) {
      const firstEntry = result.results[0];
      console.log('Properties:', Object.keys(firstEntry.properties || {}));

      // Show properties details
      for (const [key, prop] of Object.entries(firstEntry.properties || {})) {
        console.log(`\n${key} (${prop.type}):`);
        console.log(JSON.stringify(prop, null, 2));
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
