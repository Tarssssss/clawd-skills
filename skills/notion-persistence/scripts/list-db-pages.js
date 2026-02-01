#!/usr/bin/env node

/**
 * List pages in the database using search
 */

const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function listDatabasePages(databaseId) {
  const response = await notion.search({
    filter: {
      value: 'database',
      property: 'object',
    },
  });

  // Find the database and get its pages
  const db = response.results.find(r => r.id === databaseId);

  if (!db) {
    throw new Error('Database not found');
  }

  // Query pages in this database
  const pages = await notion.databases.query({
    database_id: databaseId,
  });

  return pages;
}

// CLI
(async () => {
  try {
    const databaseId = process.argv[2] || '2fa8daf1727c80ccb060d231a56723e4';

    console.log('📊 Querying database pages...');
    const result = await listDatabasePages(databaseId);

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
    console.error(err.stack);
    process.exit(1);
  }
})();
