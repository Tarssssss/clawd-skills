---
name: apple-memo
description: Access and export Apple Notes/Memo data
---

# Apple Notes/Memo Skill

读取 Apple Notes/Memo 并导出为 Markdown 或 JSON。

## 功能

- 读取 Apple Notes 中的备忘录
- 读取 Notes 中的笔记
- 导出为 Markdown 或 JSON
- 可选：保存到 Notion 或发送到 Telegram

## 系统要求

- **macOS**：需要 macOS 系统
- **Apple Notes/Memo 应用**：需要安装并至少有一个备忘录或笔记
- **权限**：需要授予访问 Apple Notes/Memo 的权限

## 配置

在 `.env` 文件中配置：

```bash
# 备忘录名称（可选）
# 如果有多个备忘录，可以指定要读取的备忘录名称
# 留空则读取所有备忘录
MEMO_NAME=My Notes

# 导出格式
# 可选值：markdown, json
EXPORT_FORMAT=markdown

# Notion 配置（可选，如果需要保存到 Notion）
NOTION_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id

# Telegram 配置（可选，如果需要发送到 Telegram）
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_GROUP_ID=your_group_id
```

## 使用方式

### 1. 读取并导出到标准输出

```bash
cd skills/apple-memo
node scripts/read-memo.js
```

### 2. 读取并保存到 Notion

```bash
cd skills/apple-memo
node scripts/read-memo.js --save-notion
```

### 3. 读取并发送到 Telegram

```bash
cd skills/apple-memo
node scripts/read-memo.js --send-telegram
```

### 4. 指定备忘录名称

```bash
cd skills/apple-memo
node scripts/read-memo.js --memo-name "My Notes"
```

## 工作原理

### Apple Script 部分
使用 AppleScript 脚本读取 Apple Notes/Memo：
- 通过 `tell application "Notes"` 或 `tell application "Reminders"` 访问
- 遍历所有备忘录/笔记
- 提取标题、内容、创建时间等元数据
- 返回结构化数据（JSON 或 Markdown）

### Node.js 部分
使用 Node.js 脚本：
- 调用 `osascript` 命令执行 AppleScript
- 解析返回的数据
- 格式化为 Markdown 或 JSON
- 可选：调用 notion-persistence 或 telegram-notification skill

### 权限处理
- **首次运行**：会弹出系统权限请求对话框
- **用户需要**：点击"允许"授予访问 Apple Notes/Memo 的权限
- **后续运行**：不再需要授权，可以直接访问

## 数据安全

- **本地执行**：所有操作都在本地完成，不经过任何服务器
- **不传输数据**：除非你选择保存到 Notion 或发送到 Telegram
- **权限受控**：只有明确授权的 skill 才能访问

## 输出格式

### Markdown 格式

```markdown
# 备忘录/笔记名称

## 条目 1
**标题**：[备忘录/笔记标题]
**创建时间**：[创建时间]
**内容**：[完整内容]

## 条目 2
...
```

### JSON 格式

```json
{
  "memo_name": "My Notes",
  "export_time": "2026-01-31T12:00:00Z",
  "items": [
    {
      "type": "note" | "reminder",
      "title": "备忘录/笔记标题",
      "content": "完整内容",
      "created_date": "创建时间",
      "modified_date": "修改时间"
    }
  ]
}
```

## 集成 Skills

- **notion-persistence**：保存到 Notion
- **telegram-notification**：发送到 Telegram

使用方式：
```bash
# 读取并保存到 Notion
node scripts/read-memo.js --save-notion

# 读取并发送到 Telegram
node scripts/read-memo.js --send-telegram
```

## 常见问题

### Q: 首次运行时弹出权限请求？
A: 正常现象！点击"允许"即可。只有首次运行需要授权。

### Q: 为什么没有读取到任何内容？
A: 检查：
1. 确保备忘录名称正确
2. 确保授予了访问权限
3. 尝试手动打开 Apple Notes/Memo，确保里面有内容

### Q: 读取失败，报错？
A: 检查：
1. 确保在 macOS 上运行
2. 确保安装了 Apple Notes/Memo 应用
3. 检查权限是否已授予

### Q: 如何撤销权限？
A: 在系统设置中：
1. 打开"系统偏好设置"
2. 选择"隐私与安全性"
3. 选择"完全磁盘访问权限"
4. 找到本 skill 并移除访问权限

## 限制

- **仅 macOS 支持**：此 skill 只能在 macOS 上运行
- **需要 Apple Notes/Memo**：需要安装相应应用
- **权限依赖**：需要用户明确授权

---

*让你的备忘录不再孤立在 Apple Notes/Memo 中！*
