# 2026-01-31

## Telegram Notification 多目标路由实现

**时间：** 2026-01-31 19:55 UTC

### 完成的工作

1. **实现多目标路由功能**
   - telegram-notification skill 现在支持多个群组 ID
   - 添加 TELEGRAM_DISCUSSION_GROUP_ID（讨论结果专用）
   - 添加 TELEGRAM_GENERAL_GROUP_ID（一般通知，可选）

2. **更新所有相关文件**
   - telegram-notification/SKILL.md：更新文档说明多目标功能
   - telegram-notification/.env.example：添加两个群组 ID 配置
   - telegram-notification/scripts/notify-group.js：添加 --target 参数支持

3. **集成 notion-persistence**
   - notion-persistence/scripts/save-discussion.js 现在调用 telegram-notification skill
   - 使用 --target discussion 参数发送到讨论群组
   - 自动生成标题和摘要

4. **更新 README**
   - 完整的工作流程说明
   - 多目标使用示例
   - 讨论群组清洁性说明

### 配置信息

**Telegram 群组：**
- TELEGRAM_DISCUSSION_GROUP_ID: -5079148766（「使目标更清晰的讨论」）
- TELEGRAM_GENERAL_GROUP_ID: （可选，用于一般通知）

**优先级规则：**
1. --chat-id（最高优先级）
2. --target discussion
3. --target general
4. 默认（DISCUSSION_GROUP_ID）

### GitHub 推送

**仓库：** https://github.com/Tarssssss/clawd-skills
**Commit:** d31ac61 - feat: Add multi-target routing for telegram notifications
**推送状态：** ✅ 成功

### 工作流程

```
目标澄清讨论
        ↓
【goal-clarification】
读取协议 → 讨论目标和解法 → 生成讨论结果
        ↓
【notion-persistence】
调用 telegram-notification（--target discussion）
  → 创建 Notion 页面 → 保存完整讨论结果
  → 发送摘要到讨论群组
        ↓
【telegram-notification】
发送摘要到「使目标更清晰的讨论」群组 → 包含标题、时间、链接、摘要
```

### 群组清洁性保证

**讨论结果** → 发送到 TELEGRAM_DISCUSSION_GROUP_ID（-5079148766）
**一般通知**（GitHub 推送等）→ 发送到 TELEGRAM_GENERAL_GROUP_ID（如果配置）

这保证了「使目标更清晰的讨论」群组只包含讨论结果，不会被一般通知"污染"。

### 下一步

当以后需要发送一般通知（如 GitHub 推送成功）时，可以：
1. 配置 TELEGRAM_GENERAL_GROUP_ID
2. 使用 `--target general` 参数发送
