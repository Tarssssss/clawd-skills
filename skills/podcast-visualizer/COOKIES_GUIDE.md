# 🍪 如何提供YouTube Cookies

## 方法1: 自动导出（推荐）

### 步骤1: 确保浏览器已登录YouTube

在你的电脑或手机浏览器中：
1. 访问 https://www.youtube.com
2. 登录你的Google账号

### 步骤2: 导出Cookies

在服务器上运行以下命令：

```bash
cd /root/clawd/skills/podcast-visualizer
python3 export_cookies.py
```

这个脚本会：
- 尝试从Chrome导出cookies
- 如果Chrome失败，尝试从Firefox导出
- 将cookies保存到 `youtube_cookies.json`

**注意**: 这需要在**服务器本身**运行浏览器并登录YouTube。如果服务器是远程的，可能无法访问你的本地浏览器cookies。

### 步骤3: 使用Cookies下载

```bash
python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies youtube_cookies.json
```

---

## 方法2: 手动导出（如果你的浏览器在本地）

### 步骤1: 安装浏览器扩展

在Chrome或Firefox中安装以下扩展：

**Chrome**:
- "Get cookies.txt LOCALLY" 或 "EditThisCookie"

**Firefox**:
- "Cookie Editor"

### 步骤2: 导出YouTube Cookies

1. 访问 https://www.youtube.com
2. 登录你的账号
3. 点击浏览器扩展图标
4. 导出cookies（选择JSON格式）

### 步骤3: 上传到服务器

将导出的cookies文件上传到服务器：
```bash
# 如果使用scp
scp cookies.txt root@your-server:/root/clawd/skills/podcast-visualizer/youtube_cookies.json
```

### 步骤4: 转换格式（如果需要）

如果导出的是Netscape格式（cookies.txt），转换为JSON：

```python
import json

# 读取cookies.txt
cookies = []
with open('cookies.txt', 'r') as f:
    for line in f:
        if line.startswith('#') or not line.strip():
            continue
        parts = line.strip().split('\t')
        if len(parts) >= 7:
            cookies.append({
                'name': parts[5],
                'value': parts[6],
                'domain': parts[0],
                'path': parts[2],
            })

# 保存为JSON
with open('youtube_cookies.json', 'w') as f:
    json.dump(cookies, f)
```

### 步骤5: 使用Cookies下载

```bash
python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies youtube_cookies.json
```

---

## 方法3: 使用yt-dlp内置功能

yt-dlp支持直接从浏览器读取cookies：

```bash
# 从Chrome读取
yt-dlp --cookies-from-browser chrome https://www.youtube.com/watch?v=HiyzzcuaAac

# 从Firefox读取
yt-dlp --cookies-from-browser firefox https://www.youtube.com/watch?v=HiyzzcuaAac
```

但我们的CLI工具目前不支持这个参数，你需要修改代码。

---

## 方法4: 最简单 - 换个视频测试

如果以上方法太复杂，可以换个不需要登录的视频测试：

```bash
python3 -m src.cli https://www.youtube.com/watch?v=aN6VACVO_2I
```

---

## 推荐流程

**快速测试（推荐）**:
1. 先用公开视频测试完整功能
2. 验证下载、识别、分块、可视化都正常
3. 再处理需要登录的视频（使用cookies）

**处理目标视频**:
1. 使用方法1或2导出cookies
2. 运行: `python3 -m src.cli <URL> --cookies youtube_cookies.json`

---

## 常见问题

### Q: 为什么需要cookies？
A: YouTube有时会限制自动化访问，特别是某些受保护的视频。使用cookies可以让yt-dlp模拟你的浏览器访问。

### Q: Cookies会泄露吗？
A: Cookies只保存在本地，不会上传到任何服务器。但请注意保管好cookies文件，不要分享给他人。

### Q: Cookies有效期多久？
A: 通常YouTube cookies有效期较长，但如果登录状态改变，可能需要重新导出。

### Q: 自动导出失败怎么办？
A: 使用方法2手动导出，或直接换个视频测试。

---

你想用哪个方法？
