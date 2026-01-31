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

将讨论摘要发送到 Telegram 群组。

**功能：**
- 格式化消息（标题、时间、链接、摘要）
- 发送到指定群组

**配置：**
```bash
# 在 skill 目录下创建 .env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_GROUP_ID=-100xxxxxxxx
```

**使用：**
```bash
cd skills/telegram-notification
node scripts/notify-group.js --title "Title" --url "https://notion.so/page" --summary "Summary"
```

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
创建 Notion 页面 → 保存完整讨论结果 → 返回 URL
        ↓
【telegram-notification】
发送摘要到群组 → 包含标题、时间、链接、摘要
```

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
git clone <your-repo-url> ~/clawd/skills-custom/

# 复制需要的 skills
cp -r ~/clawd/skills-custom/goal-clarification ~/clawd/skills/
```

---

## 开发者

创建于 2026-01-31

基于 Clawdbot/OpenClaw 协议 v1.0 开发。

---

## License

MIT License - 可以自由使用、修改和分发。
