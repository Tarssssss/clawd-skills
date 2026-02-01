# 🎧 YouTube播客可视化工具 - 更新完成

## ✨ 新功能

### 支持从本地音频文件处理

现在工具支持两种模式：

#### 模式1: 从YouTube URL下载（原有功能）
```bash
python3 -m podcast_visualizer.cli_new --url <YouTube_URL> [选项]
```

#### 模式2: 从本地音频文件处理（新功能）⭐
```bash
python3 -m podcast_visualizer.cli_new --audio <音频文件.mp3> [选项]
```

## 📋 完整参数说明

```
选项：
  --url URL             YouTube视频URL
  --audio AUDIO         本地音频文件路径（MP3/M4A/WAV等）
  --metadata METADATA   元数据JSON文件路径（可选，用于--audio）
  --model-size {tiny,base,small,medium,large}
                        Whisper模型大小 (默认: medium)
  --skip-cache          跳过缓存，重新处理
  --cookies COOKIES     YouTube cookies文件路径（用于需要登录的视频）
```

## 🚀 使用场景

### 场景1: 处理公开的YouTube视频（不需要登录）

```bash
# 基本使用
python3 -m podcast_visualizer.cli_new --url https://www.youtube.com/watch?v=example

# 使用小模型（更快）
python3 -m podcast_visualizer.cli_new --url https://www.youtube.com/watch?v=example --model-size small

# 跳过缓存
python3 -m podcast_visualizer.cli_new --url https://www.youtube.com/watch?v=example --skip-cache
```

### 场景2: 处理需要登录的YouTube视频（使用cookies）

```bash
# 从YouTube URL + cookies下载
python3 -m podcast_visualizer.cli_new --url https://www.youtube.com/watch?v=example --cookies youtube_cookies.txt

# 使用小模型
python3 -m podcast_visualizer.cli_new --url https://www.youtube.com/watch?v=example --cookies youtube_cookies.txt --model-size small
```

### 场景3: 从本地音频文件处理（绕过YouTube）⭐ 推荐

```bash
# 基本使用（使用默认元数据）
python3 -m podcast_visualizer.cli_new --audio podcast.mp3

# 使用自定义元数据
python3 -m podcast_visualizer.cli_new --audio podcast.mp3 --metadata metadata.json

# 使用小模型
python3 -m podcast_visualizer.cli_new --audio podcast.mp3 --model-size small
```

## 📁 元数据JSON格式（可选）

当使用`--audio`参数时，可以提供`--metadata`指定元数据：

```json
{
  "title": "播客标题",
  "description": "播客描述或shownotes",
  "uploader": "发布者/频道",
  "duration": 3600,
  "upload_date": "2026-01-31",
  "view_count": 1000,
  "video_id": "episode_001",
  "url": "https://youtube.com/watch?v=example"
}
```

如果不提供`--metadata`，将使用默认元数据（从文件名推断）。

## 🎯 推荐工作流程

### 流程A: YouTube视频（公开）
1. 找到公开的YouTube视频
2. 运行: `python3 -m podcast_visualizer.cli_new --url <URL> --model-size small`
3. 等待处理完成
4. 访问 http://localhost:8501

### 流程B: YouTube视频（需要登录）⭐ 最实用
1. **在你的电脑上**:
   - 登录YouTube
   - 下载播客音频（MP3）
   - 导出元数据（标题、描述等）

2. **上传到服务器**:
   ```bash
   scp podcast.mp3 metadata.json root@server:/root/clawd/skills/podcast-visualizer/
   ```

3. **在服务器上处理**:
   ```bash
   cd /root/clawd/skills/podcast-visualizer
   python3 -m podcast_visualizer.cli_new --audio podcast.mp3 --metadata metadata.json
   ```

4. **访问网站**: http://localhost:8501

### 流程C: 从任何音频文件处理

1. 准备音频文件（MP3/M4A/WAV）
2. 准备元数据（可选）
3. 运行: `python3 -m podcast_visualizer.cli_new --audio <audio_file>`
4. 访问可视化网站

## 💡 优势

### 使用`--audio`参数的好处

1. **绕过YouTube限制**
   - 无需cookies
   - 无需登录
   - 无需处理机器人验证

2. **更灵活**
   - 可以处理任何音频文件
   - 不限于YouTube
   - 可以处理从其他平台下载的播客

3. **更可靠**
   - 不依赖YouTube API
   - 不受网络波动影响
   - 可以重复处理同一文件

4. **更快**
   - 跳过下载步骤
   - 直接开始语音识别
   - 节省时间

## ⚠️ 注意事项

1. **音频格式**: 支持MP3、M4A、WAV等常见格式
2. **元数据**: 描述字段用于timeline解析，如果有shownotes建议提供
3. **模型大小**: small模型更快，medium模型更准确
4. **首次使用**: Whisper模型首次下载约需5GB空间
5. **处理时间**: 1小时音频约需20-40分钟

## 🔧 技术细节

### TorchCodec警告

```
torchcodec is not installed correctly
```

这是警告，不影响核心功能。Whisper使用自己的音频解码，不需要torchcodec。

### 缓存机制

- 音频文件缓存到 `cache/<video_id>.mp3`
- 识别结果缓存到 `cache/<video_id>.json`
- Streamlit数据缓存到 `cache/<video_id>_streamlit.json`

---

**最后更新**: 2026-02-01
**版本**: v0.2.0
**新增功能**: 支持从本地音频文件处理
