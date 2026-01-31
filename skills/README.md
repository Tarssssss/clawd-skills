# Clawdbot Skills

自定义的 Clawdbot/Clawdbot skills，用于目标澄清和讨论结果管理。

## Skills

### 1. goal-clarification

目标澄清协议，用于结构化地讨论复杂目标。

**功能：**
- 提供结构化的目标讨论流程
- 目标层和解法层的讨论
- 生成执行 prompt
- 版本化管理

**使用：**
```bash
# 每次需要澄清目标时
# 读取 SKILL.md 了解用法
# 读取 CLARIFICATION_PROTOCOL.md 了解协议内容
```

**相关：** notion-persistence, telegram-notification

---

### 2. notion-persistence

将讨论结果保存到 Notion Database。

**功能：**
- 自动生成标题（基于讨论内容）
- 创建 Notion 页面（包含完整讨论结果）
- 返回页面 URL
- **集成 telegram-notification**，使用 `--target discussion` 参数

**配置：**
```bash
# 在 skill 目录下创建 .env
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_database_id
```

**使用：**
```bash
cd skills/notion-persistence
node scripts/save-discussion.js --content "Discussion result content"
```

**相关：** goal-clarification, telegram-notification

---

### 3. telegram-notification

将讨论摘要和通知发送到指定的 Telegram 群组，支持灵活路由。

**功能：**
- 格式化消息（标题、时间、链接、摘要）
- 支持多个推送目标（讨论群组、一般通知群组）
- 支持直接指定群组 ID

**配置：**
```bash
# 在 skill 目录下创建 .env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_DISCUSSION_GROUP_ID=target_group_id      # 讨论结果专用
TELEGRAM_GENERAL_GROUP_ID=optional_general_group_id  # 一般通知（可选）
```

**使用示例：**

**发送到讨论群组：**
```bash
cd skills/telegram-notification
node scripts/notify-group.js --target discussion \
  --title "讨论标题" \
  --url "https://notion.so/page" \
  --summary "简要摘要"
```

**发送到一般通知群组：**
```bash
node scripts/notify-group.js --target general --message "GitHub 推送成功！"
```

**直接发送到指定群组（覆盖）：**
```bash
node scripts/notify-group.js --chat-id -100xxxxxxxx --message "自定义消息"
```

**目标选项：**
| 目标 | 环境变量 | 用途 |
|------|-----------|------|
| `--target discussion` | `TELEGRAM_DISCUSSION_GROUP_ID` | 目标澄清讨论结果 |
| `--target general` | `TELEGRAM_GENERAL_GROUP_ID` | 一般通知（如 GitHub 推送）|
| `--chat-id <id>` | 直接指定，覆盖 | 发送到任意群组 |

**优先级：**
1. `--chat-id`（最高优先级）
2. `--target discussion`
3. `--target general`
4. 默认（`TELEGRAM_DISCUSSION_GROUP_ID`）

**相关：** goal-clarification, notion-persistence

---

## 完整工作流程

```
用户发起目标澄清讨论
        ↓
【goal-clarification】
读取协议 → 讨论目标和解法 → 生成讨论结果
        ↓
【notion-persistence】
调用 telegram-notification（--target discussion）
  → 创建 Notion 页面 → 保存完整讨论结果 → 返回 URL
        ↓
【telegram-notification】
发送摘要到「使目标更清晰的讨论」群组 → 包含标题、时间、链接、摘要
```

**讨论群组保持清洁：**
- 只有讨论结果会发送到 `TELEGRAM_DISCUSSION_GROUP_ID`（-5079148766）
- 其他通知（如 GitHub 推送）可以发送到 `TELEGRAM_GENERAL_GROUP_ID`
- 避免讨论群组被一般通知"污染"

---

## 安装

### 方式 1：手动安装

```bash
# 复制 skill 文件夹到你的 workspace 的 skills/ 目录
cp -r goal-clarification ~/clawd/skills/
cp -r notion-persistence ~/clawd/skills/
cp -r telegram-notification ~/clawd/skills/

# 安装依赖
cd ~/clawd/skills/notion-persistence && npm install
cd ~/clawd/skills/telegram-notification && npm install
```

### 方式 2：从 Git 仓库克隆

```bash
# 克隆这个仓库
git clone https://github.com/Tarssssss/clawd-skills.git ~/clawd/skills-custom/

# 复制需要的 skills
cp -r ~/clawd/skills-custom/goal-clarification ~/clawd/skills/
cp -r ~/clawd/skills-custom/notion-persistence ~/clawd/skills/
cp -r ~/clawd/skills-custom/telegram-notification ~/clawd/skills/
```

---

## 配置

### 必须配置

**Notion 沉淀：**
- `NOTION_TOKEN`: Notion API token
- `NOTION_DATABASE_ID`: Notion Database ID

**Telegram 通知：**
- `TELEGRAM_BOT_TOKEN`: Telegram Bot token
- `TELEGRAM_DISCUSSION_GROUP_ID`: 讨论结果群组 ID（必需）
- `TELEGRAM_GENERAL_GROUP_ID`: 一般通知群组 ID（可选）

### 获取群组 ID

**方法 1：Via @getidsbot**
1. 邀请 @getidsbot 到群组
2. Bot 回复群组 ID（格式：-100xxxxxxx）
3. 复制 ID 到配置

**方法 2：Via Telegram Desktop**
1. 右键点击群组名称
2. View Group Info
3. 检查是否显示 ID

**方法 3：Via Web Version**
1. 在 web.telegram.org 打开群组
2. 检查浏览器 URL

---

## 开发者

创建于 2026-01-31

基于 Clawdbot/OpenClaw 协议 v1.0 开发。

---

## License

MIT License - 可以自由使用、修改和分发。
