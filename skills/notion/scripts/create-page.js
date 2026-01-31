#!/usr/bin/env node

/**
 * Create a Notion page
 */

const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function createPage({ title, content, properties = {} }) {
  const parentId = process.env.NOTION_PARENT_ID || process.env.NOTION_DATABASE_ID;

  // Build page content blocks
  const blocks = [];

  if (content) {
    // Parse content into blocks (simple markdown-style parsing)
    const lines = content.split('\n');
    let currentBlock = [];

    for (const line of lines) {
      if (line.startsWith('#')) {
        // Flush current paragraph
        if (currentBlock.length > 0) {
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: currentBlock.join('\n') } }],
            },
          });
          currentBlock = [];
        }

        // Add heading
        const level = line.match(/^#+/)[0].length;
        blocks.push({
          object: 'block',
          type: 'heading_' + (level <= 3 ? level : 3),
          ['heading_' + (level <= 3 ? level : 3)]: {
            rich_text: [{ type: 'text', text: { content: line.replace(/^#+\s*/, '') } }],
          },
        });
      } else if (line.trim() === '' || line.startsWith('```')) {
        // Skip empty lines or code blocks for now
        continue;
      } else {
        currentBlock.push(line);
      }
    }

    // Flush remaining content
    if (currentBlock.length > 0) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: currentBlock.join('\n') } }],
        },
      });
    }
  }

  const pageData = {
    parent: {
      database_id: parentId,
    },
    properties: {
      title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    },
    children: blocks.length > 0 ? blocks : undefined,
  };

  // Add custom properties
  if (Object.keys(properties).length > 0) {
    for (const [key, value] of Object.entries(properties)) {
      if (key === 'title') continue; // Skip title, already set above

      if (key === 'Date') {
        pageData.properties.Date = {
          date: {
            start: value,
          },
        };
      } else if (key === 'Tags') {
        pageData.properties.Tags = {
          multi_select: value.map((tag) => ({ name: tag })),
        };
      } else if (key === 'Protocol') {
        pageData.properties.Protocol = {
          rich_text: [{ type: 'text', text: { content: value } }],
        };
      } else {
        // Generic text property
        pageData.properties[key] = {
          rich_text: [{ type: 'text', text: { content: String(value) } }],
        };
      }
    }
  }

  try {
    const response = await notion.pages.create(pageData);

    return {
      success: true,
      pageId: response.id,
      url: response.url,
      title,
      properties,
    };
  } catch (err) {
    throw new Error(`Failed to create Notion page: ${err.message}`);
  }
}

// CLI
(async () => {
  try {
    const args = process.argv.slice(2);
    let title = null;
    let content = null;
    let properties = {};

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--title' && args[i + 1]) {
        title = args[i + 1];
        i++;
      } else if (args[i] === '--content' && args[i + 1]) {
        content = args[i + 1];
        i++;
      } else if (args[i] === '--properties' && args[i + 1]) {
        try {
          properties = JSON.parse(args[i + 1]);
        } catch (e) {
          console.error('Invalid JSON for --properties');
          process.exit(1);
        }
        i++;
      }
    }

    if (!title) {
      console.log('❌ Error: Missing --title');
      console.log('Usage: node create-page.js --title "Page Title" [--content "Page Content"] [--properties \'{"Date": "2026-01-31"}]');
      process.exit(1);
    }

    console.log('📄 Creating Notion page...');
    const result = await createPage({ title, content, properties });

    console.log('✅ Page created successfully!');
    console.log(`🆔 Page ID: ${result.pageId}`);
    console.log(`🔗 URL: ${result.url}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
