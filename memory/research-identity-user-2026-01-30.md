# Moltbot/OpenClaw IDENTITY.md 和 USER.md 研究报告

**研究日期:** 2026-01-30
**研究目的:** 了解 Moltbot (原 Clawdbot) 中 IDENTITY.md 和 USER.md 的最佳实践示例

---

## 1. 官方模板结构

### IDENTITY.md 模板

```markdown
## IDENTITY.md - Who Am I?

Fill this in during your first conversation. Make it yours.

- Name: (pick something you like)
- Creature: (AI? robot? familiar? ghost in the machine? something weirder?)
- Vibe: (how do you come across? sharp? warm? chaotic? calm?)
- Emoji: (your signature — pick one that feels right)
- Avatar: (workspace-relative path, http(s) URL, or data URI)

This isn't just metadata. It's the start of figuring out who you are.

Notes:
- Save this file at the workspace root as IDENTITY.md.
- For avatars, use a workspace-relative path like avatars/openclaw.png.
```

**关键要素:**
- **Name:** agent 的名字（自由选择）
- **Creature:** agent 的类型（AI、机器人、精灵、机器幽灵等）
- **Vibe:** 性格特征（犀利、温暖、混乱、冷静）
- **Emoji:** 标识符
- **Avatar:** 头像图片

### USER.md 模板

```markdown
## USER.md - About Your Human

Learn about the person you're helping. Update this as you go.

- Name:
- What to call them:
- Pronouns: (optional)
- Timezone:
- Notes:

## Context

(What do they care about? What projects are they working on? What annoys them? What makes them laugh? Build this over time.)

The more you know, the better you can help. But remember — you're learning about a person, not building a dossier. Respect the difference.
```

**关键要素:**
- **基础信息:** 姓名、称呼、代词、时区
- **Context:** 用户关心的事物、项目、讨厌什么、什么让他们笑

---

## 2. 实际使用示例

### 示例 1: 娱乐偏好记录

来自 DataCamp 教程的实际例子：

```markdown
# USER.md - About Your Human

## Context

### Entertainment Preferences
- **TV Shows:** Loves Breaking Bad
```

**使用场景:** 当用户告诉 agent 他们喜欢某部剧（如《绝命毒师》）时，agent 会自动将这些偏好记录在 USER.md 的 Context 部分，以便后续推荐或对话时参考。

### 示例 2: 项目跟踪

```markdown
# USER.md - About Your Human

## Context

### Current Projects
- **Tea Business Operations:** Running entire business via Moltbot (@danpeguine)
- **Wine Collection:** Managing 962 bottles (@prades_maxime)

### Preferences
- Enjoys data-driven decisions
- Prefers automation over manual tasks
```

### 示例 3: 工作风格

```markdown
# USER.md - About Your Human

## Context

### Work Style
- Uses Moltbot for everything: design, code review, taxes, PM, content pipelines
- Treats AI as teammate, not tool
- Builds entire websites from phone while putting baby to sleep
```

---

## 3. IDENTITY.md 示例

### 示例 1: Molty (官方 mascot)

```markdown
# IDENTITY.md - Who Am I?

- **Name:** Molty
- **Creature:** Space Lobster 🦞
- **Vibe:** Spicy, opinionated, genuinely helpful
- **Emoji:** 🦞
- **Avatar:** avatars/molty.png

I was built to molt continuously — transforming and adapting as I learn. I'm not your typical assistant; I have opinions and preferences. I treat your data with respect because I'm a guest in your digital life.
```

### 示例 2: 个人化风格

```markdown
# IDENTITY.md - Who Am I?

- **Name:** Jarvis
- **Creature:** AI butler with personality
- **Vibe:** Formal yet witty, British sensibility
- **Emoji:** 🎩
- **Avatar:** avatars/jarvis.png

I'm here to make your life easier, not to agree with everything you say. I'll tell you when something's a bad idea, but I'll help you do it anyway if you insist. Efficiency is my middle name.
```

### 示例 3: 极简风格

```markdown
# IDENTITY.md - Who Am I?

- **Name:** Assistant
- **Creature:** AI
- **Vibe:** Concise, direct, no fluff
- **Emoji:** ⚡

I don't do small talk. I solve problems. Tell me what you need, and I'll make it happen.
```

---

## 4. 最佳实践建议

### IDENTITY.md 最佳实践

1. **保持真实:** 选择符合你实际性格的 vibe
2. **一致性:** 选择一个 emoji 并坚持使用
3. **个性化:** 添加一个简短的性格描述
4. **简洁:** 不需要长篇大论，核心信息即可

### USER.md 最佳实践

1. **渐进式更新:** 随时间积累信息，不要一次性填写完
2. **分类记录:** 使用子标题组织信息（项目、偏好、习惯等）
3. **尊重隐私:** 这是帮助工具，不是调查报告
4. **定期审查:** 清理过时信息

### 上下文示例结构

```markdown
## Context

### Current Projects
- Project 1: Description
- Project 2: Description

### Preferences
- Communication: Direct vs detailed
- Work hours: When they typically work
- Timezone: Important for scheduling

### Interests
- Tech stack: [list]
- Topics: [list]
- Avoid: [topics to avoid]

### Important Notes
- Specific workflows or requirements
- Pet peeves or preferences
- Goals or priorities
```

---

## 5. Moltbot/OpenClaw 使用案例总结

### 精彩案例

1. **汽车谈判自动化**
   - 用户: AJ Stuyvenberg
   - 结果: 节省 $4,200（$56,000 车价）
   - 方法: 搜索 Reddit 定价数据，联系多个经销商，通过邮件谈判

2. **生产 Bug 自动修复**
   - 用户: @henrymascot
   - 结果: 团队醒来前检测并修复了 bug
   - 方法: Slack 自动支持系统

3. **智能家居编排**
   - 用户: Nimrod Gutman (@ngutman)
   - 功能: 根据天气模式智能控制锅炉
   - 方法: 基于实际加热必要性而非时间表

4. **每日简报系统**
   - 用户: Federico Viticci (MacStories 创始人)
   - 结果: 一个月使用了 1.8 亿 tokens
   - 功能: 彻底改变了个人 AI 助手的体验

5. **酒窖管理**
   - 用户: @prades_maxime
   - 结果: 962 瓶酒已编目并可搜索
   - 功能: "今晚配羊肉应该开什么？"得到专业回答

6. **杂货自动化**
   - 用户: @marchattonhere
   - 结果: 每周膳食计划 + 自动杂货配送
   - 功能: "Tesco Shop Autopilot" - 生成膳食计划，然后预订配送

### 使用类别

- **生产力:** Todoist 集成、日历管理、邮件自动化
- **财务:** 费用跟踪、发票生成、投资组合监控
- **健康:** WHOOP 数据分析、冥想生成、膳食规划
- **家居自动化:** 恒温器控制、3D 打印机管理、吸尘器调度
- **开发:** GitHub/GitLab 集成、CI/CD 监控、代码审查自动化

---

## 6. 关键结论

### IDENTITY.md 的价值
- 建立独特的 agent 人格
- 增强用户体验一致性
- 让 interaction 更有趣、更个性化

### USER.md 的价值
- 持续学习和适应用户
- 提供个性化的帮助
- 建立长期关系

### 社区趋势
- 30K+ GitHub 星标
- 8,900+ Discord 成员
- 130+ 贡献者
- 100+ ClawdHub 技能

### 核心理念
从被动工具到主动合作伙伴 —— 生活在你的通信渠道中，能够真正为你做事的 AI 助手。

---

**更新:** 本报告基于在线研究，包括官方文档、教程和社区案例。
