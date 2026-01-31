---
name: telegram-notification
description: Send discussion summary notifications to Telegram group for easy access.
---

# Telegram Notification Skill

Send goal clarification discussion summaries to Telegram group for user access.

## Configuration

Set environment variables in `.env` file in this skill directory:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_GROUP_ID=target_group_id
```

## Quick Commands

### Send Discussion Summary

```bash
node scripts/notify-group.js --title "Discussion Title" --url "https://notion.so/page" --summary "Brief summary"
```

### Send Custom Message

```bash
node scripts/notify-group.js --message "Custom message"
```

## Automation Workflow

When a goal clarification discussion completes and is saved to Notion, this skill sends a formatted summary to the specified Telegram group:

```
✅ 讨论结果已保存到 Notion

标题：[Auto-generated Title]
时间：YYYY-MM-DD HH:MM
链接：[Notion URL]

摘要：[Brief summary of goal and solution]
```

## Message Format

The notification includes:
- **Title**: Auto-generated discussion title
- **Time**: Discussion timestamp
- **Link**: Notion page URL for full details
- **Summary**: Brief overview extracted from content

## Getting Group ID

### Method 1: Via @getidsbot
1. Invite @getidsbot to the group
2. Bot replies with group ID (format: -100xxxxxxx)
3. Copy the ID to configuration

### Method 2: Via Telegram Desktop
1. Right-click on group name
2. View Group Info
3. Check if ID is displayed (some versions show it)

### Method 3: Via Web Version
1. Open group in web.telegram.org
2. Check browser URL for group ID

## Dependencies

None required (uses curl for HTTP requests).

## Security Notes

- Store TELEGRAM_BOT_TOKEN in `.env` (add to `.gitignore`)
- Group ID is public, but only send to configured group
- Never expose tokens in logs or messages

## Usage Example

After discussion result is saved to Notion:

```bash
# Send summary to Telegram group
node scripts/notify-group.js \
  --title "跨渠道记忆机制" \
  --url "https://www.notion.so/2026-01-31-1903-..." \
  --summary "当前记忆机制已够用，通过 MEMORY.md + daily memory + memory_search 实现"

# Output:
# ✅ Telegram message sent
# 🆔 Message ID: 123456
```

## Related Skills

- **goal-clarification**: Provide structured discussion protocol
- **notion-persistence**: Save discussion results to Notion

## Complete Workflow

For complete goal clarification workflow:

1. **Goal Clarification** (goal-clarification skill)
   - Read protocol
   - Discuss goal and solution
   - Generate discussion result

2. **Save to Notion** (notion-persistence skill)
   - Create Notion page with discussion result
   - Return page URL

3. **Notify Telegram** (this skill)
   - Send formatted summary to Telegram group
   - Include link to Notion page
