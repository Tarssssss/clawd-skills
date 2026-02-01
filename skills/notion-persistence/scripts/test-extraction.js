/**
 * Test file for Notion extraction functions
 * Run: node test-extraction.js
 */

const { generateTitle, extractSummary, extractBackground } = require('./utils.js');

// Test cases
const testCases = [
  {
    name: 'Test 1: Simple discussion with background',
    content: `## 目标描述

**背景**
需要在 macOS 上访问 Apple Notes/Memo 数据。

**需求**
1. 使用 osascript
2. 导出为 Markdown

## 解法说明

使用 AppleScript 获取数据。`,
    expected: {
      title: '需要在 macOS 上访问 Apple Notes/Memo 数据',
      background: '需要在 macOS 上访问 Apple Notes/Memo 数据。',
    },
  },
  {
    name: 'Test 2: Discussion with empty background',
    content: `## 目标描述

## 解法说明

使用 AppleScript 获取数据。`,
    expected: {
      title: '使用 AppleScript 获取数据',
      background: '无背景信息',
    },
  },
  {
    name: 'Test 3: Discussion with summary paragraph',
    content: `## 目标描述

这是一个测试内容。我们想验证提取逻辑是否正常工作。

## 解法说明

使用 AppleScript 获取数据。`,
    expected: {
      summary: '这是一个测试内容。我们想验证提取逻辑是否正常工作。',
    },
  },
];

console.log('🧪 Testing extraction functions...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(60));

  console.log('\nContent:');
  console.log(testCase.content);

  const title = generateTitle(testCase.content);
  const summary = extractSummary(testCase.content);
  const background = extractBackground(testCase.content);

  console.log('\n📋 Generated title:');
  console.log(`  "${title}"`);

  if (testCase.expected.title) {
    const titleMatch = title.includes(testCase.expected.title) ||
                        title === testCase.expected.title;
    console.log(`  ✅ Expected: "${testCase.expected.title}"`);
    if (!titleMatch) {
      console.log(`  ❌ Title mismatch!`);
    }
  }

  console.log('\n📄 Extracted summary:');
  console.log(`  "${summary}"`);

  if (testCase.expected.summary) {
    const summaryMatch = summary.includes(testCase.expected.summary);
    console.log(`  ✅ Expected: "${testCase.expected.summary}"`);
    if (!summaryMatch) {
      console.log(`  ❌ Summary mismatch!`);
    }
  }

  console.log('\n📄 Extracted background:');
  console.log(`  "${background}"`);

  if (testCase.expected.background) {
    const backgroundMatch = background.includes(testCase.expected.background);
    console.log(`  ✅ Expected: "${testCase.expected.background}"`);
    if (!backgroundMatch) {
      console.log(`  ❌ Background mismatch!`);
    }
  }
});

console.log('\n' + '='.repeat(60));
console.log('✅ Testing complete!');
console.log('='.repeat(60) + '\n');
