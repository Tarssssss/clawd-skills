# 📁 本地音频文件测试 - 完整指南

## 🎯 测试目标

用你下载的播客音频文件测试完整功能，验证：
- ✅ 语音识别
- ✅ 说话人分离
- ✅ Timeline解析
- ✅ 智能分块
- ✅ Streamlit可视化网站

## 📋 准备步骤

### 步骤1: 下载播客音频

在你的电脑上，用浏览器或工具下载一个播客：

**推荐：10-15分钟的短播客**（测试更快）

示例：
- Huberman Lab任何一期（YouTube下载）
- TED Talk（YouTube下载）
- 任何你喜欢的播客

**下载方法：**
1. **浏览器扩展**: 如"Video DownloadHelper"
2. **在线工具**: 如 y2mate.com
3. **命令行**:
   ```bash
   yt-dlp -x --audio-format mp3 <YouTube_URL>
   ```

### 步骤2: 上传到服务器

在你的电脑终端中运行：

```bash
# 替换为你的服务器IP
scp podcast.mp3 root@your-server-ip:/root/clawd/skills/podcast-visualizer/
```

**如果使用SSH密钥：**
```bash
scp -i your_key.pem podcast.mp3 root@your-server-ip:/root/clawd/skills/podcast-visualizer/
```

### 步骤3: （可选）准备元数据

如果你想提供完整的元数据（标题、描述等），创建一个`metadata.json`文件：

```json
{
  "title": "播客标题",
  "description": "播客描述或shownotes（可选）",
  "uploader": "发布者或频道（可选）",
  "duration": 600,
  "upload_date": "2026-01-31",
  "view_count": 1000,
  "video_id": "episode_001",
  "url": "https://youtube.com/watch?v=example"
}
```

然后上传：
```bash
scp metadata.json root@your-server-ip:/root/clawd/skills/podcast-visualizer/
```

## 🚀 在服务器上运行

上传完成后，连接到服务器并运行：

### 基本使用（从文件名推断元数据）
```bash
cd /root/clawd/skills/podcast-visualizer
python3 -m podcast_visualizer.cli_new --audio podcast.mp3
```

### 使用自定义元数据
```bash
python3 -m podcast_visualizer.cli_new --audio podcast.mp3 --metadata metadata.json
```

### 使用小模型（更快）
```bash
python3 -m podcast_visualizer.cli_new --audio podcast.mp3 --model-size small
```

### 使用medium模型（更准确）
```bash
python3 -m podcast_visualizer.cli_new --audio podcast.mp3 --model-size medium
```

## 📊 处理时间预估

| 音频时长 | small模型 | medium模型 |
|---------|-----------|------------|
| 10分钟 | ~5分钟 | ~15分钟 |
| 15分钟 | ~8分钟 | ~20分钟 |
| 30分钟 | ~15分钟 | ~40分钟 |

*注：首次使用需下载模型（约5GB），时间会更长*

## ✅ 成功标志

处理成功后会看到：

```
============================================================
🎧 播客可视化工具
============================================================
📁 使用本地音频文件: podcast.mp3
✓ 识别完成，共XXX个片段
✓ 分块完成，共X个话题
✓ 结果已保存到: cache/podcast.json
============================================================
🚀 启动交互式网站...
============================================================

🌐 访问 http://localhost:8501 查看可视化网站
按 Ctrl+C 停止服务
```

## 🌐 访问网站

处理完成后，在浏览器访问：

```
http://your-server-ip:8501
```

如果是在服务器本机：
```
http://localhost:8501
```

## 🎯 测试功能

在网站上验证：

### 1. 基础功能
- [ ] 网站能正常打开
- [ ] 音频可以播放
- [ ] 对话内容显示

### 2. 语音识别
- [ ] 文字稿准确度可接受
- [ ] 时间戳正确

### 3. 说话人分离
- [ ] 不同说话人用不同颜色
- [ ] 说话人标签准确（如果有多人）

### 4. Timeline解析
- [ ] 如果有描述，能正确解析时间戳
- [ ] 话题分块合理

### 5. 交互功能
- [ ] 点击话题可以跳转
- [ ] 搜索功能正常
- [ ] 播放器同步

## 🆘 故障排查

### 问题1: 文件不存在
```
❌ 错误: 音频文件不存在: podcast.mp3
```
**解决**：检查文件是否正确上传

### 问题2: 模型下载慢
```
📝 正在下载Whisper模型...
```
**解决**：首次使用需要下载，耐心等待（约5GB）

### 问题3: 网站无法访问
```
Connection refused
```
**解决**：检查端口8501是否被占用

## 📞 后续操作

测试成功后可以：

1. **处理更多音频** - 上传其他播客音频
2. **测试长音频** - 尝试30-60分钟的播客
3. **测试shownotes** - 在metadata.json中提供描述，测试timeline解析
4. **导出结果** - 从cache目录获取识别结果

---

**准备好后告诉我！** 我会帮你监控处理进度。
