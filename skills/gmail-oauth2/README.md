# Gmail OAuth2 Access

使用 OAuth2 访问 Gmail，无需应用专用密码。

## 为什么需要这个？

Google 已停用"安全性较低的应用访问"和应用专用密码，现在必须使用 OAuth2 进行身份验证。

## 快速开始

### 1. 获取 Google OAuth 凭据

1. 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 创建一个新项目（或选择现有项目）
3. 点击 **"+ 创建凭据"** → **"OAuth 客户端 ID"**
4. 选择应用类型：**"Web 应用"**
5. 名称：`Clawdbot Gmail`
6. **已获授权的重定向 URI** 中添加：
   - `http://127.0.0.1:3000`
7. 点击 **"创建"**
8. 复制 **客户端 ID** 和 **客户端密钥**

### 2. 配置 `.env` 文件

编辑 `.env` 文件，填入你的凭据：

```bash
GOOGLE_CLIENT_ID=你的客户端ID
GOOGLE_CLIENT_SECRET=你的客户端密钥
```

### 3. 安装依赖

```bash
npm install
```

### 4. 授权 Gmail 访问

```bash
npm run auth
```

这将：
1. 生成 OAuth URL
2. 尝试打开浏览器
3. 让你登录 Google 并授权
4. 输入授权码
5. 保存访问令牌到 `gmail-tokens.json`

## 使用方法

### 检查未读邮件

```bash
# 检查最新的 10 条未读邮件
npm run check

# 检查最近 2 小时内的未读邮件
node scripts/check.js --recent 2h

# 检查最新的 20 条未读邮件
node scripts/check.js --limit 20
```

### 搜索邮件

```bash
# 搜索所有未读邮件
node scripts/search.js is:unread

# 搜索特定发件人的邮件
node scripts/search.js --from boss@company.com

# 搜索最近 1 天内的邮件
node scripts/search.js --recent 1d

# 搜索主题包含特定词的邮件
node scripts/search.js --subject "urgent"

# 组合搜索
node scripts/search.js --from support@domain.com --recent 7d
```

### 获取邮件详情

```bash
node scripts/get.js <message-id>
```

从 `check.js` 或 `search.js` 的输出中获取邮件 ID。

### 发送邮件

```bash
# 简单文本邮件
node scripts/send.js --to user@example.com --subject "Hello" --body "World"

# 从文件读取邮件内容
node scripts/send.js --to user@example.com --subject "Report" --body-file message.txt
```

## 工作原理

1. **OAuth2 流程**：
   - 使用 Client ID 和 Secret 生成授权 URL
   - 用户在浏览器中授权访问 Gmail
   - 获取 access_token 和 refresh_token
   - 令牌保存在 `gmail-tokens.json`

2. **令牌刷新**：
   - Access token 会过期（通常 1 小时）
   - Refresh token 用于获取新的 access token
   - googleapis 库会自动处理令牌刷新

3. **安全**：
   - 凭据保存在本地 `.env` 文件
   - 令牌保存在本地 `gmail-tokens.json` 文件
   - 不会上传到远程服务器

## 故障排除

### 授权失败

如果出现 `invalid_grant` 错误：

```bash
# 删除令牌文件
rm scripts/gmail-tokens.json

# 重新授权
npm run auth
```

### 更新 OAuth 客户端类型

如果你之前创建的是 "桌面应用" 类型，需要更新为 "Web 应用"：

1. 在 Google Cloud Console 凭据页面
2. 点击你的 OAuth 客户端 ID
3. 将应用类型改为 **"Web 应用"**
4. 在 "已获授权的重定向 URI" 中添加：`http://127.0.0.1:3000`
5. 点击 **"保存"**

### 无法打开浏览器

`auth.js` 会尝试打开浏览器，如果失败：

1. 复制显示的 URL
2. 手动在浏览器中打开
3. 完成授权后，复制授权码
4. 粘贴到终端

### 令牌过期

Refresh token 理论上可以永久使用，但如果失效：

```bash
# 删除令牌文件
rm scripts/gmail-tokens.json

# 重新授权
npm run auth
```

## 在 Clawdbot 中使用

示例：每小时检查未读邮件并发送摘要

```bash
clawdbot cron add \
  --name "email-check" \
  --cron "0 * * * *" \
  --session isolated \
  --message "Check Gmail for unread emails and summarize them"
```

在隔离的 session 中：

```bash
cd /root/clawd/skills/gmail-oauth2
node scripts/check.js --recent 1h
```

## 安全建议

1. **不要提交凭据到 Git**：
   - `.env` 和 `gmail-tokens.json` 已添加到 `.gitignore`

2. **定期更新凭据**：
   - 如果怀疑凭据泄露，在 Google Cloud Console 中撤销并重新创建

3. **限制访问范围**：
   - 当前使用的范围：`gmail.modify` 和 `gmail.send`
   - 如果只需要读取，可以使用 `gmail.readonly`

4. **监控活动**：
   - 在 Google 账户安全设置中检查第三方应用的访问权限
