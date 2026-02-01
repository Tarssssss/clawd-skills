/**
 * Utility functions for Notion operations
 */

/**
 * Generate title from discussion content
 */
function generateTitle(content) {
  const lines = content.split('\n');

  // Try to extract meaningful content from "目标描述" section
  let inGoalSection = false;
  let goalKeywords = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect "目标描述" section
    if (line.startsWith('## ') && (line.includes('目标描述') || line.includes('Goal Description'))) {
      inGoalSection = true;
      continue;
    }

    // Exit goal section when hitting another ##
    if (inGoalSection && line.startsWith('## ')) {
      break;
    }

    // Extract keywords from background and requirements in goal section
    if (inGoalSection) {
      // Look for **背景** or **需求** or **Background** or **Requirements**
      const isBackgroundField = line.startsWith('**背景**') || line.startsWith('**Background**');
      const isRequirementsField = line.startsWith('**需求**') || line.startsWith('**Requirements**');

      if (isBackgroundField || isRequirementsField) {
        const colonIndex = line.indexOf('：') !== -1 ? line.indexOf('：') : line.indexOf(':');
        if (colonIndex !== -1) {
          const value = line.substring(colonIndex + 1).trim();
          // Filter out empty values or just ellipsis
          if (value && value.length > 0 && value !== '...') {
            goalKeywords.push(value);
          }
        }
      } else if (!line.startsWith('**') && line.length > 0 && !line.startsWith('---') && !line.startsWith('-')) {
        // Non-bold lines in goal section might be content
        const cleaned = line.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
        // Filter out ellipsis and very short content
        if (cleaned.length > 2 && cleaned !== '...') {
          goalKeywords.push(cleaned);
        }
      }
    }
  }

  // Use first meaningful keyword from goal section
  if (goalKeywords.length > 0) {
    const firstKeyword = goalKeywords[0];
    // Shorten if too long (50 chars including the ...)
    if (firstKeyword.length > 50) {
      return firstKeyword.substring(0, 47) + '...';
    }
    return firstKeyword;
  }

  // Fallback 1: Try to extract from other meaningful headers (not "目标描述")
  for (const line of lines) {
    if (line.startsWith('## ')) {
      const header = line.replace('## ', '').trim();
      // Skip generic section headers
      const skipHeaders = [
        '目标描述',
        '解法说明',
        '执行 Prompt',
        '注意事项',
        'Goal Description',
        'Solution Explanation',
        'Execution Prompt',
        'Notes',
        'Solution',
        '解法'
      ];
      if (!skipHeaders.includes(header)) {
        return header;
      }
    }
  }

  // Fallback 2: use first meaningful non-header line
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('```') && !trimmed.startsWith('---')) {
      const cleaned = trimmed.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
      // Filter out ellipsis and short content
      if (cleaned.length > 2 && cleaned !== '...') {
        if (cleaned.length > 50) {
          return cleaned.substring(0, 47) + '...';
        }
        return cleaned;
      }
    }
  }

  return '讨论结果';
}

/**
 * Extract background from content
 * Updated to handle both "## 背景" section and "**背景**" fields
 */
function extractBackground(content) {
  const lines = content.split('\n');
  let backgroundLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect "**背景**" or "**Background**" field (anywhere in content)
    if (line.startsWith('**背景**') || line.startsWith('**Background**')) {
      // Find the content on the same line or next lines
      const colonIndex = line.indexOf('：') !== -1 ? line.indexOf('：') : line.indexOf(':');
      
      if (colonIndex !== -1) {
        // Content is on the same line after the colon
        const value = line.substring(colonIndex + 1).trim();
        if (value && value.length > 0 && value !== '...') {
          backgroundLines.push(value);
        }
      } else {
        // Content might be on the next line(s)
        let j = i + 1;
        while (j < lines.length && j < i + 5) { // Check next 5 lines
          const nextLine = lines[j].trim();
          if (nextLine.length > 0 && 
              !nextLine.startsWith('**') && 
              !nextLine.startsWith('##') && 
              !nextLine.startsWith('---')) {
            backgroundLines.push(nextLine);
            j++;
          } else if (nextLine.startsWith('**') || nextLine.startsWith('##')) {
            // Stop at next field or section
            break;
          } else {
            j++;
          }
        }
      }
    }
  }

  // Join lines and limit length
  const background = backgroundLines.join(' ').trim();
  return background.length > 0 ? background.substring(0, 200) : '无背景信息';
}

/**
 * Extract summary from content
 * Now tries to extract from "**背景**" field first, then falls back to first paragraph
 */
function extractSummary(content) {
  const lines = content.split('\n');

  // Priority 1: Extract from "**背景**" or "**Background**" field
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('**背景**') || line.startsWith('**Background**')) {
      const colonIndex = line.indexOf('：') !== -1 ? line.indexOf('：') : line.indexOf(':');
      
      if (colonIndex !== -1) {
        const value = line.substring(colonIndex + 1).trim();
        if (value && value.length > 0) {
          return value.substring(0, 200);
        }
      } else {
        // Content on next lines
        let j = i + 1;
        const contentLines = [];
        while (j < lines.length && j < i + 5) {
          const nextLine = lines[j].trim();
          if (nextLine.length > 0 && 
              !nextLine.startsWith('**') && 
              !nextLine.startsWith('##') && 
              !nextLine.startsWith('---')) {
            contentLines.push(nextLine);
            j++;
          } else {
            break;
          }
        }
        if (contentLines.length > 0) {
          return contentLines.join(' ').substring(0, 200);
        }
      }
    }
  }

  // Priority 2: Find first meaningful paragraph
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('```') && !trimmed.startsWith('---')) {
      return trimmed.substring(0, 200);
    }
  }

  return '讨论内容...';
}

module.exports = {
  generateTitle,
  extractSummary,
  extractBackground,
};
