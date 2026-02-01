# Notion Universal Saver

**Universal Notion saver with type-driven configuration**

## 概述

这个 skill 提供了一个通用的 Notion 保存解决方案，**一旦配置，未来新增任何类型都不需要修改代码**。

## 核心特性

### 1. 配置驱动
- 通过 `.env` 配置类型映射
- 支持 3 种调用方式（完整配置、配置名称、向后兼容）
- 完全外部化 properties 定义

### 2. 完全解耦
- skill 只负责"保存"和"通知"
- properties 完全由调用方定义
- 无需维护内部 schema

### 3. 无限扩展
- 未来新增任何类型只需在 `.env` 添加配置
- 支持 3 种优先级的配置方式
- 零代码修改

## 使用方式

### 方式 1：完整配置（推荐，未来新增类型）

```bash
node save-content.js \
  --content-file meeting-summary.md \
  --type meeting_summary \
  --database-id abc123def456... \
  --telegram-target -100xxx \
  --properties '{
    "Title": {"title": [{"text": {"content": "产品评审会议"}}]},
    "Date": {"date": {"start": "2026-02-02"}},
    "Participants": {"multi_select": [{"name": "张三"}, {"name": "李四"}]},
    "Duration": {"number": 120}
  }'
```

**特点：**
- ✅ 不需要修改 `.env`
- ✅ 完全参数化
- ✅ 最灵活

### 方式 2：配置名称（已配置的类型）

```bash
node save-content.js \
  --content-file result.md \
  --type discussion \
  --properties '{
    "title": {"title": [{"text": {"content": "讨论结果"}}]},
    "Date": {"date": {"start": "2026-02-02"}}
  }'
```

**特点：**
- ✅ 从 `.env` 读取配置
- ✅ 适用于已配置的类型
- ✅ 集中管理

### 方式 3：向后兼容（支持旧版调用）

```bash
node save-content.js \
  --content-file result.md \
  --target discussion \
  --properties '{
    "title": {"title": [{"text": {"content": "讨论结果"}}]},
    "Date": {"date": {"start": "2026-02-02"}}
  }'
```

**特点：**
- ✅ 支持旧版调用方式
- ✅ 平滑迁移
- ✅ 向后兼容

## 配置

### `.env` 配置

1. **复制示例配置：**
   ```bash
   cp .env.example .env
   ```

2. **编辑 `.env` 文件，填写：**
   - Notion API Token
   - Database IDs（对应不同类型）
   - Telegram Bot Token
   - Telegram Group/User IDs

### `.env.example` 结构

```bash
# Notion API Token（全局）
# Get from: https://www.notion.so/my-integrations
NOTION_TOKEN=your_notion_token_here

# 类型配置（格式：NOTION_DB_{TYPE_NAME}）
NOTION_DB_DISCUSSION=your_discussion_database_id_here
NOTION_DB_DAILY_REPORT=your_daily_report_database_id_here

# Telegram 目标配置（格式：TELEGRAM_{TYPE_NAME}_GROUP_ID）
TELEGRAM_DISCUSSION_GROUP_ID=your_discussion_group_id_here
TELEGRAM_DAILY_REPORT_GROUP_ID=your_daily_report_group_id_here

# Telegram Bot Token（全局）
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### 获取 Database ID

1. 打开 Notion Database
2. 复制 URL 中的 32 位十六进制字符串
   - URL 格式：`https://www.notion.so/XXXXXXXXX?v=...`
   - XXXXXXXXX 就是 Database ID

### 新增类型的步骤

1. **在 Notion 中创建 Database**
   - 设置 properties
   - 复制 Database ID

2. **在 `.env` 中添加配置**
   ```bash
   NOTION_DB_MEETING_SUMMARY=abc123def456...
   TELEGRAM_MEETING_SUMMARY_GROUP_ID=-100xxx
   ```

3. **调用（使用方式 1 或方式 2）**
   ```bash
   node save-content.js \
     --type meeting_summary \
     --properties '{...}'
   ```

**✅ 完成！无需修改任何代码！**

## 工作流程

```
外部 skill（如 meeting-summary）
    ↓
构建 properties
    ↓
调用 save-content.js
    ↓
获取类型配置（.env 或参数）
    ↓
保存到 Notion
    ↓
发送到 Telegram
    ↓
✅ 完成
```

## 示例

### 示例 1：保存讨论结果

```bash
node save-content.js \
  --content "今天完成了目标澄清讨论" \
  --type discussion \
  --properties '{
    "title": {"title": [{"text": {"content": "目标澄清讨论"}}]},
    "Date": {"date": {"start": "2026-02-02"}},
    "Protocol": {"rich_text": [{"type": "text", "text": {"content": "v1.0"}}]}
  }'
```

### 示例 2：保存每日报告

```bash
node save-content.js \
  --content "今天完成了3件事..." \
  --type daily_report \
  --properties '{
    "Title": {"title": [{"text": {"content": "每日报告"}}]},
    "Date": {"date": {"start": "2026-02-02"}},
    "Time Block": {"rich_text": [{"type": "text", "text": {"content": "Heartbeat"}}]},
    "Tags": {"multi_select": [{"name": "学习-AI"}]}
  }'
```

### 示例 3：未来新增类型（会议总结）

```bash
# 步骤 1：在 .env 中添加配置
# NOTION_DB_MEETING_SUMMARY=abc123...
# TELEGRAM_MEETING_SUMMARY_GROUP_ID=-100xxx

# 步骤 2：调用
node save-content.js \
  --content-file meeting-summary.md \
  --type meeting_summary \
  --properties '{
    "Title": {"title": [{"text": {"content": "产品评审会议"}}]},
    "Date": {"date": {"start": "2026-02-02"}},
    "Participants": {"multi_select": [{"name": "张三"}, {"name": "李四"}]},
    "Duration": {"number": 120}
  }'
```

## 与旧版 skill 的对比

| 维度 | notion-persistence | notion-persistence-universal |
|------|-------------------|------------------------------|
| 配置方式 | 硬编码 database ID | 完全配置驱动 |
| 新增类型 | 需要修改代码 | 只需配置，无需修改代码 |
| Properties | 内置 schema | 完全外部化 |
| 向后兼容 | N/A | 支持 3 种调用方式 |
| 扩展性 | 有限 | 无限 |

## 迁移建议

### 从旧版迁移

```bash
# 旧版（旧 skill）
node skills/notion-persistence/scripts/save-discussion.js --target discussion

# 新版（新 skill）
node skills/notion-persistence-universal/scripts/save-content.js --type discussion
```

### 逐步迁移

1. **保留旧版 skill** - 现有调用继续工作
2. **新增功能使用新版** - 从一开始就用新架构
3. **逐步迁移** - 随时间推移，逐步迁移旧调用

## 注意事项

1. **Properties 格式**
   - 必须符合 Notion API 格式
   - 参考 Notion API 文档

2. **Database ID**
   - 必须是有效的 32 位十六进制字符串
   - 可以从 Database URL 中提取

3. **Telegram Target**
   - 可以是用户 ID 或群组 ID
   - 留空则跳过通知

4. **向后兼容**
   - 旧版调用使用 `--target` 参数
   - 新版调用使用 `--type` 参数

---

*最后更新：2026-02-02*
*版本：1.0.0*
