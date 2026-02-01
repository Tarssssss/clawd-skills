#!/usr/bin/env node

/**
 * Read page content to check template usage
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;

async function readPageContent(pageId) {
  const url = `https://api.notion.com/v1/blocks/${pageId}/children`;

  try {
    const result = execSync(
      `curl -s "${url}" -H "Authorization: Bearer ${NOTION_TOKEN}" -H "Notion-Version: 2022-06-28"`,
      { encoding: 'utf-8' }
    );

    const data = JSON.parse(result);

    console.log(`\n📄 Page Content (Page ID: ${pageId})`);
    console.log(`🔗 URL: https://www.notion.so/${pageId.replace(/-/g, '')}\n`);

    if (data.results && data.results.length > 0) {
      for (const block of data.results) {
        const type = block.type;
        const text = block[type]?.rich_text?.map(t => t.text?.content).join('') || '';
        console.log(`[${type}] ${text}`);
      }
    } else {
      console.log('(no content)');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

const pageId = process.argv[2] || '2fa8daf1-727c-8186-bafb-da31c18669fb';
readPageContent(pageId);
