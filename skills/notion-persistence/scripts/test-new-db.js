#!/usr/bin/env node

/**
 * Test database with new ID
 */

const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function test() {
  try {
    const databaseId = '2fa8daf1727c80929790e2e9a276371d';

    console.log('1. Retrieving database...');
    const db = await notion.databases.retrieve({ database_id: databaseId });
    console.log('Database title:', db.title[0]?.plain_text);
    console.log('Has properties?', !!db.properties);
    console.log('Property keys:', Object.keys(db.properties || {}));

    console.log('\n2. Querying database for pages...');
    const pages = await notion.databases.query({ database_id: databaseId });
    console.log(`Found ${pages.results.length} pages`);

    if (pages.results.length > 0) {
      const page = pages.results[0];
      console.log('\nFirst page properties:');
      console.log('Property keys:', Object.keys(page.properties));

      for (const [key, prop] of Object.entries(page.properties)) {
        console.log(`\n${key}:`);
        console.log(`  Type: ${prop.type}`);
        if (prop.type === 'title') {
          console.log(`  Value: ${prop.title[0]?.text?.content}`);
        } else if (prop.type === 'date') {
          console.log(`  Value: ${prop.date?.start}`);
        } else if (prop.type === 'rich_text') {
          console.log(`  Value: ${prop.rich_text[0]?.text?.content}`);
        } else if (prop.type === 'multi_select') {
          console.log(`  Value: ${prop.multi_select?.map(o => o.name).join(', ')}`);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err);
  }
}

test();
