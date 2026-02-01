# 🤖 浏览器自动化获取Cookies说明

由于服务器环境没有图形界面，使用浏览器自动化获取cookies比较复杂。

## 📋 当前情况

**✅ 已完成:**
- 安装了Playwright
- 下载了Chromium浏览器
- 安装了Xvfb虚拟显示

**❌ 问题:**
- 服务器没有图形界面（无DISPLAY）
- 无法看到浏览器窗口
- 无法进行登录操作

## 🎯 推荐方案（最简单）

### 方案1: 手动导出Cookies（5分钟）

**步骤:**

1. **在你的本地电脑上:**
   - 打开Chrome或Firefox
   - 访问 https://www.youtube.com
   - 登录你的账号

2. **安装浏览器扩展:**

   **Chrome:**
   - 搜索并安装: **"Get cookies.txt LOCALLY"** 或 **"EditThisCookie"**
   - 点击扩展图标
   - 导出cookies（选择JSON格式）

   **Firefox:**
   - 搜索并安装: **"Cookie Editor"**
   - 点击扩展图标
   - 导出cookies

3. **上传到服务器:**

   ```bash
   # 将导出的cookies.json文件上传到服务器
   scp cookies.json root@your-server:/root/clawd/skills/podcast-visualizer/youtube_cookies.json
   ```

4. **使用cookies下载:**

   ```bash
   cd /root/clawd/skills/podcast-visualizer
   python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies youtube_cookies.json
   ```

### 方案2: 使用VNC（较复杂）

需要额外安装VNC服务器和客户端，步骤较多。

### 方案3: 直接提供账号密码（最快速）

我可以创建一个脚本使用账号密码自动登录YouTube。

**提供你的Google账号和密码，我会帮你:**
1. 自动登录YouTube
2. 获取cookies
3. 保存到文件

**安全说明:**
- 凭证只在本地使用
- 不会上传到任何地方
- 完成后可以立即删除

---

## 🚀 建议

**最佳流程:**

1. **先验证功能** - 用公开视频测试
   ```bash
   python3 -m src.cli https://www.youtube.com/watch?v=aN6VACVO_2I
   ```
   验证下载、识别、分块、可视化都正常

2. **再处理目标视频** - 使用cookies
   ```bash
   python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies youtube_cookies.json
   ```

---

## ❓ 你想选择哪个方案？

1. **手动导出cookies** - 参考COOKIES_GUIDE.md
2. **提供账号密码** - 我帮你自动登录获取（更快速）
3. **先换个视频测试** - 先验证功能正常

告诉我你的选择！
