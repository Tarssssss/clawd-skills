# Notion 标题生成修复总结

## 问题描述

Goal Clarification 讨论结果导出到 Notion 时，所有笔记的标题都是"目标描述"，而不是对整体讨论内容的总结。

## 根本原因

在 `scripts/save-discussion.js` 的 `generateTitle` 函数中，代码直接抓取第一个 `## ` 二级标题作为标题。由于讨论结果模板中第一个二级标题始终是"目标描述"，因此所有笔记的标题都变成了"目标描述"。

## 解决方案

### 1. 重构代码结构

将 `generateTitle` 和 `extractSummary` 函数从 `save-discussion.js` 提取到单独的 `scripts/utils.js` 文件中，便于测试和维护。

### 2. 改进标题生成逻辑

新的 `generateTitle` 函数采用多级回退策略：

**第一优先级**：从"目标描述"部分提取有意义的内容
- 识别 `**背景**` / `**Background**` 或 `**需求**` / `**Requirements**` 字段
- 提取冒号后的实际内容作为标题
- 过滤掉空值和只有省略号的内容

**第二优先级**：从其他有意义的二级标题提取
- 跳过通用章节标题（如"目标描述"、"解法说明"等）
- 使用特定主题标题（如"创建自动化测试系统"）

**第三优先级**：从第一个有意义的非标题行提取
- 跳过 markdown 标题、代码块和分隔符
- 提取并清理第一段内容

**最终回退**：返回默认标题"讨论结果"

### 3. 标题长度限制

- 最大长度：50 个字符（包括 "..." 后缀）
- 超过限制时自动截断并添加 "..."

## 修改的文件

1. **新增**：`scripts/utils.js` - 包含工具函数 `generateTitle` 和 `extractSummary`
2. **修改**：`scripts/save-discussion.js` - 从 `utils.js` 导入工具函数

## 测试覆盖

测试了以下场景：
- ✅ 从"目标描述"的背景字段提取
- ✅ 从"目标描述"的需求字段提取
- ✅ 从其他有意义的章节标题提取
- ✅ 从第一行有意义的内容提取（回退场景）
- ✅ 英文格式的内容提取
- ✅ 长标题自动截断

## 效果示例

### 修复前
```
所有笔记标题：2026-01-31 1900 - 目标描述
```

### 修复后
```
笔记标题 1：2026-01-31 1900 - 想要提高工作效率，减少拖延
笔记标题 2：2026-01-31 1930 - 建立个人知识库
笔记标题 3：2026-01-31 2000 - 创建自动化测试系统
笔记标题 4：2026-01-31 2100 - Need to improve email management
```

## 向后兼容性

- ✅ 完全向后兼容
- ✅ 不影响现有的 Notion API 调用
- ✅ 不影响 Telegram 通知功能
- ✅ CLI 接口保持不变

## 使用方式

无需修改使用方式，直接调用 `save-discussion.js` 即可：

```bash
node scripts/save-discussion.js --content "讨论结果内容" --protocol v1.0
```

或

```bash
node scripts/save-discussion.js --content-file result.md --protocol v1.0
```

## 维护建议

- 如需调整标题生成逻辑，修改 `scripts/utils.js` 中的 `generateTitle` 函数
- 如需添加更多测试，在 `scripts/utils.js` 中直接导出函数即可进行测试
- 标题长度限制可在 `generateTitle` 函数中的 `50` 常量处调整
