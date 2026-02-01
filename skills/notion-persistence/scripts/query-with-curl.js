#!/usr/bin/env node

/**
 * Query database using curl directly (like save-discussion.js)
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;

async function queryDatabase(databaseId) {
  const url = `https://api.notion.com/v1/databases/${databaseId}/query`;

  try {
    const result = execSync(
      `curl -s -X POST "${url}" -H "Authorization: Bearer ${NOTION_TOKEN}" -H "Content-Type: application/json" -H "Notion-Version: 2022-06-28" -d '{}'`,
      { encoding: 'utf-8' }
    );

    const data = JSON.parse(result);
    return data;
  } catch (err) {
    throw new Error(`Failed to query database: ${err.message}`);
  }
}

async function test() {
  try {
    const databaseId = '2fa8daf1727c80929790e2e9a276371d';

    console.log('📊 Querying database...');
    const result = await queryDatabase(databaseId);

    console.log(`✅ Found ${result.results.length} entries`);

    if (result.results.length > 0) {
      const page = result.results[0];
      console.log('\n📋 First entry properties:');
      console.log('Property keys:', Object.keys(page.properties));

      for (const [key, prop] of Object.entries(page.properties)) {
        console.log(`\n${key} (${prop.type}):`);
        if (prop.type === 'title') {
          console.log(`  Value: ${prop.title[0]?.text?.content}`);
        } else if (prop.type === 'date') {
          console.log(`  Value: ${prop.date?.start}`);
        } else if (prop.type === 'rich_text') {
          console.log(`  Value: ${prop.rich_text[0]?.text?.content}`);
        } else if (prop.type === 'multi_select') {
          console.log(`  Value: ${prop.multi_select?.map(o => o.name).join(', ')}`);
        } else if (prop.type === 'select') {
          console.log(`  Value: ${prop.select?.name}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  }
}

test();
