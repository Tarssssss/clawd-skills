# Notion 提取问题修复与预防方案

## 问题描述

**症状：**
- Notion 页面中"背景"和"摘要"字段为空
- 标题能够正常生成

**根本原因：**
1. **提取逻辑缺陷**：`extractSummary` 函数只查找"第一个段落"，无法识别结构化的 Markdown 格式（如 `**背景**` 字段）
2. **属性映射缺失**：`createNotionPage` 函数中没有添加 `背景` (Background) 和 `摘要` (Summary) 属性到 Notion page
3. **调试困难**：没有日志来追踪提取过程

---

## 修复内容

### 1. 改进 `utils.js` 提取函数

**文件：** `/root/clawd/skills/notion-persistence/scripts/utils.js`

**改进点：**
- `extractBackground`：新增函数，智能提取 `**背景**` 或 `**Background**` 字段的内容
- `extractSummary`：优先使用 `extractBackground` 的结果，否则查找第一个段落
- 支持多种格式：
  - `**背景**` 后面跟 `：` 或 `：`
  - 内容在同一行或下一行
  - 最多提取 200 字符

**测试结果：**
```
✅ 测试 1 (有背景)：成功提取 "需要在 macOS 上访问 Apple Notes/Memo 数据。"
✅ 测试 2 (无背景)：返回 "无背景信息"
✅ 测试 3 (段落)：成功提取段落内容
```

### 2. 添加 Notion 属性映射

**文件：** `/root/clawd/skills/notion-persistence/scripts/save-discussion.js`

**改进点：**
- 导入 `extractBackground` 函数
- 在 `createNotionPage` 中添加属性：
  ```javascript
  // 背景 (Background) 属性
  if (background && background !== '无背景信息') {
    pageData.properties.Background = {
      rich_text: [{ type: 'text', text: { content: background } }],
    };
  }

  // 摘要 (Summary) 属性
  if (summary && summary !== '讨论内容...') {
    pageData.properties.Summary = {
      rich_text: [{ type: 'text', text: { content: summary } }],
    };
  }
  ```

### 3. 添加调试日志

**改进点：**
- 添加内容长度日志：`📊 Content length: X characters`
- 添加提取结果日志：
  - `📝 Generated title: ...`
  - `📋 Extracted summary: ...`
  - `📋 Extracted background: ...`
- 便于追踪提取过程

### 4. 添加自动化测试

**文件：** `/root/clawd/skills/notion-persistence/scripts/test-extraction.js`

**功能：**
- 自动测试提取函数
- 验证各种内容格式
- 输出详细测试报告

**运行测试：**
```bash
cd /root/clawd/skills/notion-persistence/scripts
node test-extraction.js
```

---

## 预防方案（以后稳定不出现此类问题）

### 1. 规范化讨论内容格式

**建议格式：**
```markdown
## 目标描述

**背景**
[背景内容]

**需求**
[需求内容]

## 解决说明
[解决步骤]
```

**关键点：**
- 使用 `**背景**` 作为背景信息的标题
- 背景内容放在 `**背景**` 后面，同一行或下一行都可以
- 使用 `：` 或 `：` 分隔

### 2. 建立测试流程

**每次更新提取逻辑后：**
1. 运行 `node test-extraction.js` 验证
2. 检查测试报告中的所有用例
3. 确保没有 `❌` 标记

### 3. 添加日志监控

**调试步骤：**
1. 查看提取日志：`📋 Extracted summary: ...`
2. 如果提取不正确，检查内容格式
3. 如果格式正确但提取失败，报告 bug

### 4. 版本控制与回滚

**策略：**
- 使用 Git 管理脚本版本
- 重大更新前创建备份分支
- 出现问题时可以快速回滚

**示例：**
```bash
cd /root/clawd/skills/notion-persistence
git checkout -b fix-extraction-v2
# 修改代码
git add .
git commit -m "fix: improve extraction logic"
# 测试不通过则回滚
git checkout master
```

### 5. 文档维护

**保持文档更新：**
- 更新 `SKILL.md` 中的使用说明
- 记录已知问题和解决方案
- 提供常见问题解答

---

## 技术细节

### Notion API 属性结构

```javascript
properties: {
  title: { title: [...] },
  Date: { date: { start: "2026-02-02" } },
  Protocol: { rich_text: [...] },
  Background: { rich_text: [...] },      // 新增
  Summary: { rich_text: [...] }        // 新增
}
```

### 提取优先级

**`extractSummary` 的优先级：**
1. `**背景**` 字段内容（最多 200 字符）
2. `**Background**` 字段内容（最多 200 字符）
3. 第一个有意义的段落（最多 200 字符）
4. 默认值："讨论内容..."

### 错误处理

**边界情况：**
- 空内容 → 返回默认值
- 格式不正确 → 优雅降级到段落提取
- 过长内容 → 截断到 200 字符并添加 "..."
- 特殊字符 → 清理 markdown 格式

---

## 验证步骤

### 1. 单元测试
```bash
cd /root/clawd/skills/notion-persistence/scripts
node test-extraction.js
```

**预期输出：**
- 所有测试用例都显示 `✅` 标记
- 没有 `❌` 标记

### 2. 集成测试
```bash
# 使用真实讨论内容测试
node save-discussion.js --content-file test-discussion.md
```

**验证点：**
- Notion 页面正确创建
- 标题不为空
- 背景不为空（如果有背景信息）
- 摘要不为空
- Telegram 消息正确发送

### 3. 回归测试

**测试场景：**
- 有背景的讨论
- 无背景的讨论
- 特殊格式的讨论
- 超长内容的讨论

---

## 快速参考

### 修改后的文件
1. `/root/clawd/skills/notion-persistence/scripts/utils.js`
2. `/root/clawd/skills/notion-persistence/scripts/save-discussion.js`
3. `/root/clawd/skills/notion-persistence/scripts/test-extraction.js` (新增)

### 运行测试
```bash
cd /root/clawd/skills/notion-persistence/scripts
node test-extraction.js
```

### 保存讨论
```bash
node save-discussion.js --content "讨论内容" --target discussion
```

### 常见问题

**Q: 背景提取不正确怎么办？**
A: 检查内容格式，确保使用 `**背景**` 作为标题

**Q: 如何调试提取问题？**
A: 查看控制台日志中的 `📋 Extracted summary` 和 `📋 Extracted background`

**Q: 支持哪些格式？**
A: 支持 `**背景**`、`**Background**`，内容可以跟在后面或下一行

---

## 总结

**问题已解决：**
- ✅ 提取逻辑改进，支持多种格式
- ✅ 添加 Notion 属性映射
- ✅ 添加调试日志
- ✅ 添加自动化测试

**未来保障：**
- 📋 规范化内容格式
- 🧪 建立测试流程
- 📝 版本控制与回滚
- 📚 文档维护
- 🐛 快速诊断与修复

**预期效果：**
- 以后稳定不出现此类问题
- 出现问题可以快速诊断和修复
- 有完善的测试和文档支持
