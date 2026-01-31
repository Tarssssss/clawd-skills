---
name: notion
description: Notion API for creating pages and databases. Use when you need to create discussion results or save content to Notion.
---

# Notion Skill

Integrates with Notion API to create pages and database entries.

## Configuration

Set environment variables in `.env` file in this skill directory:

```bash
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_database_id
NOTION_PARENT_ID=parent_page_or_database_id
```

## Quick Commands

### Create Page

```bash
node scripts/create-page.js --title "Page Title" --content "Page Content"
```

### Create Database Entry

```bash
node scripts/create-entry.js --title "Title" --properties '{"Date": "2026-01-31", "Tags": ["clarification"]}'
```

### Update Database

```bash
node/scripts/update-db.js --entry-id "entry-id" --properties '{"Status": "Done"}'
```

## Usage in Discussions

After completing a goal clarification discussion, create a Notion page with:

1. **Title**: `YYYY-MM-DD HH:MM - [Auto-generated Title]`
2. **Content**: Full discussion result (goal + solution + execution prompt)
3. **Properties**:
   - Date: Discussion date
   - Tags: Related topics
   - Protocol Version: CLARIFICATION_PROTOCOL version used

## Dependencies

```bash
npm install @notionhq/client dotenv
```

## Security Notes

- Store NOTION_TOKEN in `.env` (add to `.gitignore`)
- Token should have permissions to read/write content in the specified database
- Never expose tokens in logs or messages
