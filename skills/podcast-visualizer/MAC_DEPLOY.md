# 🖥️ Mac mini 部署指南

## 🎯 优势

在Mac mini上部署的优势：
- ✅ 完整GUI环境，浏览器直接显示
- ✅ 可以手动处理2FA验证
- ✅ 调试更方便
- ✅ 不需要虚拟显示（Xvfb等）

## 📦 快速部署（5分钟）

### 1. 安装Python依赖

```bash
cd /path/to/podcast-visualizer
pip3 install -r requirements.txt
```

### 2. 安装Playwright和浏览器

```bash
# 安装Playwright
pip3 install playwright

# 安装Chromium浏览器
playwright install chromium
```

### 3. 测试自动登录

```bash
# 使用改进的登录脚本
python3 auto_login_improved.py
```

现在浏览器会直接显示，你可以：
- 看到登录过程
- 手动输入2FA验证码
- 处理任何登录问题

### 4. 如果登录成功，使用cookies下载

```bash
python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies youtube_cookies.json
```

## 🎬 或者：更简单的方法

即使在Mac mini上，**最简单的方法仍然是手动导出cookies**：

### 方法1: 直接在Mac上导出（2分钟）

1. **在Mac的Safari/Chrome中登录YouTube**
2. **安装浏览器扩展**:
   - Chrome: "Get cookies.txt LOCALLY"
   - Safari: "Cookie Editor"
3. **导出cookies为JSON**
4. **运行播客下载**:
   ```bash
   python3 -m src.cli <YouTube_URL> --cookies cookies.json
   ```

### 方法2: 使用Safari的Web Inspector（不需要扩展）

1. **在Safari中登录YouTube**
2. **开启开发菜单**: Safari > 设置 > 高级 > 勾选"在菜单栏中显示开发菜单"
3. **打开Web Inspector**: 开发 > 显示Web Inspector
4. **打开Storage标签**: 找到cookies
5. **复制cookies到JSON文件**

## 🚀 推荐流程

**方案A: 自动化（需要代码调整）**
```bash
# 1. 运行自动登录
python3 auto_login_improved.py

# 2. 在显示的浏览器窗口中手动完成登录/2FA

# 3. 等待脚本自动获取cookies

# 4. 使用cookies下载播客
python3 -m src.cli <URL> --cookies youtube_cookies.json
```

**方案B: 手动导出（最简单，2分钟）⭐**
```bash
# 1. 在浏览器中登录YouTube
# 2. 导出cookies
# 3. 下载播客
python3 -m src.cli <URL> --cookies cookies.json
```

## 📋 Mac特有的命令

```bash
# 检查Python版本
python3 --version

# 安装pip（如果需要）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 使用Homebrew安装FFmpeg（如果需要）
brew install ffmpeg
```

## ⚠️ 注意事项

1. **首次运行**:
   - Playwright首次下载Chromium需要时间
   - Whisper首次下载模型需要5GB空间

2. **浏览器选择**:
   - Chrome和Safari都可以
   - 扩展支持更好用Chrome

3. **安全性**:
   - Cookies文件包含敏感信息，妥善保管
   - 处理完成后可以删除cookies

## 🎯 立即开始

### 最快的方式（3分钟）:

```bash
# 1. 在浏览器中登录YouTube（xizhicareer@gmail.com）
# 2. 导出cookies为cookies.json
# 3. 下载播客
python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies cookies.json
```

### 如果想测试自动化:

```bash
# 1. 运行登录脚本（浏览器窗口会显示）
python3 auto_login_improved.py

# 2. 手动在浏览器中完成登录/2FA

# 3. 脚本会自动获取cookies

# 4. 下载播客
python3 -m src.cli <URL> --cookies youtube_cookies.json
```

---

## 💡 建议

**在Mac mini上，手动导出cookies是最简单的**:
- 不需要等待自动化脚本
- 不需要担心2FA问题
- 2分钟搞定

自动化脚本虽然看起来很酷，但实际上手动导出更快、更可靠！
