#!/usr/bin/env node

/**
 * Delete a Notion Database (archive it)
 */

const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function archiveDatabase(databaseId) {
  const response = await notion.databases.update({
    database_id: databaseId,
    archived: true,
  });

  return response;
}

// CLI
(async () => {
  try {
    const databaseId = process.argv[2];

    if (!databaseId) {
      console.log('❌ Error: Missing database ID');
      console.log('Usage: node delete-database.js <database_id>');
      process.exit(1);
    }

    console.log(`🗑️  Archiving database: ${databaseId}...`);
    const database = await archiveDatabase(databaseId);

    console.log('✅ Database archived successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
