---
name: goal-clarification
description: Goal clarification protocol for discussing and clarifying complex goals before taking action.
---

# Goal Clarification Skill

Implement the goal clarification protocol for structured discussion of complex goals.

## Protocol Overview

This skill provides a structured workflow for:
- Clarifying complex goals
- Discussing solutions
- Generating execution prompts
- Storing discussion results

## Usage

When a complex goal is identified:

1. **Read Protocol**: Load `CLARIFICATION_PROTOCOL.md` from workspace
2. **Start Discussion**: Follow the protocol's workflow
3. **Goal Layer**: Ask questions to clarify goals
4. **Solution Layer**: Present preliminary solutions and gather feedback
5. **Confirm Completion**: Wait for user confirmation
6. **Output Results**: Generate discussion summary + execution prompt

## Triggers

### Manual Trigger
User says: "需要「使目标更清晰的讨论」"

### Agent Trigger
Agent judges that "goal is unclear or solution is complex" and asks user if discussion is needed.

**Judgment Criteria:**
- Goal is grand but current information is limited
- Solution requires multiple steps

*Note: Small tasks (like "send email") do not trigger.*

## Discussion Workflow

### Goal Layer Discussion
Agent asks questions to supplement goal information:
- Background and context of the goal
- Specific requirement details
- Expected result format
- Time constraints or priorities

### Solution Layer Discussion
Agent explains preliminary intended solution and asks:
"For this goal, your currently intended solution is xxx, which of these need modification?"

**Discussion Boundaries:**
- Agent can propose better solutions during discussion
- User can:
  - Abort discussion → Output discussion results immediately based on current discussion
  - Modify goal or solution → Update specific content

### Discussion End
- User confirms: "我们可以完成这次讨论了"
- Agent must confirm with user before, not judge independently

## Output Content

### Discussion Results (Markdown)
- More complete and clear goal description
- Discussed solutions
- Related constraints and notes

**Edge Case Handling:**
- For specific tasks, if only goal/solution discussion is needed, the other output doesn't need to be too detailed.

### Execution Prompt (Show First)
- Generate more complete prompt based on discussion results
- Used to re-input to AI agent for task execution
- **Only show for display, cannot execute immediately**

**Prompt Requirements:**
- Use prompt engineering techniques
- Express discussed goals and solutions clearly and structured
- Let models execute better

## Versioning Rules

### Version Number Format
- Format: v1.0, v1.1, v2.0
- Upgrade timing: Confirm with user when needed

### Version History
- This file only stores current version
- When upgrading, save the replaced old version to `CLARIFICATION_PROTOCOL_HISTORY.md`

### Modification Trigger
- User says: "我们更新一下协议"
- Agent actively suggests (when a rule is repeatedly broken)

### Execution Prompt Labeling
Execution prompt needs to label current protocol version, for example:
> Use CLARIFICATION_PROTOCOL v1.0 generate

## Configuration

Place protocol file at workspace root:
- `CLARIFICATION_PROTOCOL.md` - Main protocol
- `CLARIFICATION_PROTOCOL_HISTORY.md` - Version history

## Dependencies

None required for discussion protocol itself.

## Related Skills

- **notion-persistence**: Save discussion results to Notion
- **telegram-notification**: Send discussion summary to Telegram group

Use together for complete workflow:
1. Goal clarification (this skill)
2. Save results (notion-persistence)
3. Notify group (telegram-notification)
