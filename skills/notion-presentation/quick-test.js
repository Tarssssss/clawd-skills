const { generateTitle } = require('./scripts/utils.js');

const content = `# 📋 讨论结果

## 目标描述
**背景**：想要提高工作效率
**需求**：建立时间管理系统

## 解法说明`;

console.log('Generated Title:', generateTitle(content));
