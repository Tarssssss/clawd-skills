#!/usr/bin/env node

/**
 * Query all entries in database
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.argv[2] || '2fa8daf1727c80929790e2e9a276371d';

async function queryAllEntries() {
  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

  try {
    const result = execSync(
      `curl -s -X POST "${url}" -H "Authorization: Bearer ${NOTION_TOKEN}" -H "Content-Type: application/json" -H "Notion-Version: 2022-06-28" -d '{}'`,
      { encoding: 'utf-8' }
    );

    const data = JSON.parse(result);

    console.log(`✅ Found ${data.results.length} entries\n`);

    for (let i = 0; i < data.results.length; i++) {
      const page = data.results[i];
      const title = page.properties.Title?.title[0]?.text?.content || '(no title)';
      const date = page.properties.Date?.date?.start || '(no date)';
      const timeBlock = page.properties['Time Block']?.rich_text[0]?.text?.content || '(no time block)';
      const tags = page.properties.Tags?.multi_select?.map(t => t.name).join(', ') || '(no tags)';

      console.log(`\n[${i+1}] ${title}`);
      console.log(`    Date: ${date}`);
      console.log(`    Time Block: ${timeBlock}`);
      console.log(`    Tags: ${tags}`);
      console.log(`    Page ID: ${page.id}`);
      console.log(`    URL: https://www.notion.so/${page.id.replace(/-/g, '')}`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

queryAllEntries();
