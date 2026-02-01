# Podcast Visualizer Skill

将YouTube播客转换为可交互的文字稿可视化网站。

## 功能

- 从YouTube URL下载音频和描述
- 使用Whisper进行语音识别
- 使用pyannote.audio进行说话人分离
- 根据视频描述中的timeline自动分块
- 生成交互式网站，支持快速浏览对话

## 安装

```bash
pip install -r requirements.txt
```

## 配置

### Hugging Face Token设置

pyannote.audio需要Hugging Face token和用户协议接受：

1. 注册Hugging Face账号：https://huggingface.co/join
2. 生成token：https://huggingface.co/settings/tokens
3. 接受pyannote/segmentation-3.0用户协议：https://huggingface.co/pyannote/segmentation-3.0
4. 接受pyannote/speaker-diarization-3.1用户协议：https://huggingface.co/pyannote/speaker-diarization-3.1
5. 设置环境变量：

```bash
export HF_TOKEN="your_hugging_face_token"
```

或创建 `.env` 文件：
```
HF_TOKEN=your_hugging_face_token
```

## 使用

### CLI命令

```bash
# 直接运行
python -m podcast_visualizer.cli <youtube_url>

# 或安装后使用
podcast-visualize <youtube_url>
```

### 交互式网站

处理完成后，会自动启动Streamlit网站：
- 访问 http://localhost:8501
- 左侧：分块列表（可点击跳转）
- 右侧：详细对话（区分说话人颜色）
- 底部：音频播放器 + 时间轴高亮
- 搜索框：搜索关键词

## 缓存

已处理的视频会缓存到 `cache/` 目录：
- `{video_id}.mp3`：音频文件
- `{video_id}.json`：识别结果

下次处理同一视频时会使用缓存。

## 目录结构

```
skills/podcast-visualizer/
├── SKILL.md
├── requirements.txt
├── src/
│   ├── __init__.py
│   ├── downloader.py      # YouTube下载模块
│   ├── transcriber.py     # Whisper + pyannote模块
│   ├── parser.py          # Timeline解析模块
│   ├── segmenter.py       # 智能分块模块
│   ├── web_app.py         # Streamlit网站
│   └── cli.py             # CLI命令入口
├── cache/                 # 缓存目录
└── templates/             # 网站模板
```

## 注意事项

- 首次使用Whisper medium模型时会自动下载（约5GB）
- pyannote.audio首次使用时会下载模型文件
- 长播客（>30分钟）需要较长的处理时间
- 处理完成后会自动打开浏览器

## 技术栈

- **下载**：yt-dlp
- **语音识别**：OpenAI Whisper (medium模型)
- **说话人分离**：pyannote.audio
- **前端**：Streamlit
- **后端**：FastAPI
