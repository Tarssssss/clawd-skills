#!/usr/bin/env node

/**
 * Check available Notion API methods
 */

const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

console.log('Notion Client version checking...');
console.log('Available methods in notion.databases:');
console.log(Object.keys(notion.databases || {}));
console.log('\nAvailable methods in notion.pages:');
console.log(Object.keys(notion.pages || {}));
