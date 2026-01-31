---
name: telegram-notification
description: Send notifications to multiple Telegram groups with flexible routing.
---

# Telegram Notification Skill

Send goal clarification discussion summaries and other notifications to Telegram groups with flexible routing.

## Configuration

Set environment variables in `.env` file in this skill directory:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_DISCUSSION_GROUP_ID=target_group_id
TELEGRAM_GENERAL_GROUP_ID=optional_general_group_id
```

**Environment Variables:**
- `TELEGRAM_BOT_TOKEN` - Your bot token from @BotFather
- `TELEGRAM_DISCUSSION_GROUP_ID` - Primary group for discussion results (e.g., -5079148766)
- `TELEGRAM_GENERAL_GROUP_ID` - Optional group for general notifications (e.g., -100xxxxxxxx)

## Quick Commands

### Send Discussion Summary

```bash
node scripts/notify-group.js --target discussion --title "Discussion Title" --url "https://notion.so/page" --summary "Brief summary"
```

### Send General Notification

```bash
node scripts/notify-group.js --target general --message "Custom message"
```

### Send to Specific Group (by ID)

```bash
node scripts/notify-group.js --chat-id -100xxxxxxxx --message "Custom message"
```

## Target Options

The `--target` option determines which group to send to:

| Target | Environment Variable | Use Case |
|--------|---------------------|-----------|
| `discussion` | TELEGRAM_DISCUSSION_GROUP_ID | Goal clarification discussion results |
| `general` | TELEGRAM_GENERAL_GROUP_ID | General notifications (GitHub push, etc.) |
| `--chat-id <id>` | Override (direct chat ID) | Send to any specific group |

**Priority:**
1. If `--chat-id` is specified, it takes highest priority
2. If `--target discussion`, uses `TELEGRAM_DISCUSSION_GROUP_ID`
3. If `--target general`, uses `TELEGRAM_GENERAL_GROUP_ID`
4. If no target and no `--chat-id`, falls back to `TELEGRAM_DISCUSSION_GROUP_ID`

## Automation Workflow

When a goal clarification discussion completes and is saved to Notion, this skill sends a formatted summary to the **discussion group** only:

```
✅ 讨论结果已保存到 Notion

标题：[Auto-generated Title]
时间：YYYY-MM-DD HH:MM
链接：[Notion URL]

摘要：[Brief summary of goal and solution]
```

**Note:** Other notifications (like GitHub push success) can be routed to the `general` group to keep the discussion group clean.

## Message Format

The notification includes:
- **Title**: Auto-generated discussion title
- **Time**: Discussion timestamp
- **Link**: Notion page URL for full details
- **Summary**: Brief overview extracted from content

## Getting Group ID

### Method 1: Via @getidsbot
1. Invite @getidsbot to group
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
- Group IDs are public, but only send to configured groups
- Never expose tokens in logs or messages

## Usage Examples

After discussion result is saved to Notion:

```bash
# Send to discussion group (default for goal clarification)
cd skills/telegram-notification
node scripts/notify-group.js \
  --target discussion \
  --title "跨渠道记忆机制" \
  --url "https://www.notion.so/2026-01-31-1903-..." \
  --summary "当前记忆机制已够用，通过 MEMORY.md + daily memory + memory_search 实现"

# Send to general group (e.g., GitHub push notification)
node scripts/notify-group.js \
  --target general \
  --message "✅ GitHub 仓库创建并推送成功！"

# Send to specific group by ID (override)
node scripts/notify-group.js \
  --chat-id -1001234567890 \
  --message "Custom message"
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

3. **Notify Discussion Group** (this skill, --target discussion)
   - Send formatted summary to discussion group
   - Include link to Notion page

4. **Optional: Notify General Group** (this skill, --target general)
   - Send general notifications (GitHub push, etc.)
   - Keep discussion group clean
