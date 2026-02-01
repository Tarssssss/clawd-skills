# 🎧 YouTube播客可视化工具

将YouTube播客转换为可交互的文字稿可视化网站，支持说话人分离、自动分块、快速浏览等功能。

## ✨ 功能特性

- 📥 **一键下载**: 自动下载YouTube音频和元数据
- 🎤 **语音识别**: 使用OpenAI Whisper进行高精度语音识别
- 👥 **说话人分离**: 自动识别和区分不同的说话人
- 📑 **智能分块**: 根据视频描述中的timeline自动分块，或使用语义分析
- 🌐 **交互式网站**: 提供直观的Web界面，快速浏览和搜索播客内容
- 💾 **缓存机制**: 自动缓存已处理的视频，避免重复处理

## 📦 安装

### 1. 克隆或下载技能包

```bash
cd /root/clawd/skills/podcast-visualizer
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置Hugging Face Token

pyannote.audio需要Hugging Face token和用户协议接受：

#### 步骤1: 注册Hugging Face账号
访问 https://huggingface.co/join

#### 步骤2: 生成Token
访问 https://huggingface.co/settings/tokens，创建一个新的token（需要write权限）

#### 步骤3: 接受用户协议
- https://huggingface.co/pyannote/segmentation-3.0
- https://huggingface.co/pyannote/speaker-diarization-3.1

点击"Agree and access repository"按钮

#### 步骤4: 设置环境变量

创建 `.env` 文件：
```bash
HF_TOKEN=your_hugging_face_token_here
```

或在命令行中设置：
```bash
export HF_TOKEN="your_hugging_face_token_here"
```

## 🚀 使用

### 基本使用

```bash
cd /root/clawd/skills/podcast-visualizer

python -m src.cli <YouTube_URL>
```

例如：
```bash
python -m src.cli https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### 高级选项

```bash
# 指定Whisper模型大小（tiny/base/small/medium/large）
python -m src.cli <YouTube_URL> --model-size small

# 跳过缓存，重新处理
python -m src.cli <YouTube_URL> --skip-cache
```

### 模型大小对比

| 模型 | 大小 | 速度 | 准确性 | 推荐 |
|------|------|------|--------|------|
| tiny  | ~40MB | 最快 | 一般 | 测试用 |
| base  | ~75MB | 快 | 较好 | 短播客 |
| small | ~250MB | 中等 | 好 | 日常使用 |
| medium| ~1.5GB| 中等 | 很好 | **推荐** |
| large | ~3GB  | 慢 | 最好 | 长播客 |

## 🌐 交互式网站

处理完成后，会自动启动Streamlit网站：
- 访问 http://localhost:8501
- 按 `Ctrl+C` 停止服务

### 网站功能

- **左侧话题列表**: 显示所有分块话题，点击可快速跳转
- **右侧对话详情**: 显示选中话题的完整对话，不同说话人用不同颜色区分
- **底部播放器**: 内置音频播放器，支持播放、暂停、进度控制
- **搜索功能**: 在左侧搜索框输入关键词，快速查找相关内容
- **播客信息**: 显示标题、频道、时长等元数据

## 📂 目录结构

```
podcast-visualizer/
├── SKILL.md              # 技能文档
├── README.md             # 本文件
├── requirements.txt      # Python依赖
├── setup.py             # 安装脚本
├── src/
│   ├── __init__.py
│   ├── __main__.py
│   ├── downloader.py     # YouTube下载模块
│   ├── transcriber.py    # Whisper + pyannote模块
│   ├── parser.py         # Timeline解析模块
│   ├── segmenter.py      # 智能分块模块
│   ├── web_app.py        # Streamlit网站
│   └── cli.py            # CLI命令入口
└── cache/                # 缓存目录
    ├── <video_id>.mp3    # 音频文件
    ├── <video_id>.json   # 识别结果
    └── <video_id>_streamlit.json  # Streamlit数据
```

## 💾 缓存机制

已处理的视频会自动缓存到 `cache/` 目录：
- `{video_id}.mp3`: 音频文件
- `{video_id}.json`: 识别结果（包含transcription和segments）
- `{video_id}_streamlit.json`: Streamlit网站数据

下次处理同一视频时会自动使用缓存，无需重新识别。

使用 `--skip-cache` 参数可以强制重新处理：
```bash
python -m src.cli <YouTube_URL> --skip-cache
```

## 🔧 工作流程

1. **下载**: 使用yt-dlp下载YouTube音频和描述
2. **识别**: Whisper进行语音识别（带时间戳）
3. **分离**: pyannote.audio进行说话人分离
4. **合并**: 合并识别和分离结果，生成带说话人标签的文字稿
5. **分块**: 根据描述中的timeline或语义分析分块
6. **可视化**: 启动Streamlit网站，展示分块后的对话

## ⚠️ 注意事项

1. **首次使用**: Whisper medium模型首次下载约需5GB空间，下载时间取决于网络速度
2. **说话人分离**: pyannote.audio首次使用时会下载模型文件（约500MB）
3. **长播客**: 处理时间与视频长度成正比，30分钟视频约需5-10分钟
4. **GPU加速**: 如有NVIDIA GPU，会自动使用CUDA加速，显著提升速度
5. **网络要求**: 需要稳定的网络连接（下载YouTube视频和模型文件）

## 🐛 常见问题

### Q: 提示"需要Hugging Face token"
A: 参见"安装"部分的"配置Hugging Face Token"步骤

### Q: 识别速度很慢
A: 尝试使用更小的模型（如 `--model-size small`）或使用GPU

### Q: 说话人分离不准确
A: pyannote.audio在清晰录音上表现最好，背景噪音或多人同时说话会影响准确性

### Q: Streamlit网站无法访问
A: 检查端口8501是否被占用，或尝试指定其他端口（修改cli.py中的端口号）

### Q: 如何清空缓存
A: 删除 `cache/` 目录中的所有文件：
```bash
rm -rf cache/*
```

## 🔮 未来计划

- [ ] 支持更多平台（Apple Podcasts、Spotify、小宇宙）
- [ ] 优化说话人分离准确性
- [ ] 支持导出为Markdown/PDF
- [ ] 添加对话标注功能
- [ ] 支持多语言识别
- [ ] 云端部署方案

## 📄 许可证

MIT License

## 🙏 致谢

- [Whisper](https://github.com/openai/whisper) - OpenAI的语音识别模型
- [pyannote.audio](https://github.com/pyannote/pyannote-audio) - 说话人分离工具
- [Streamlit](https://streamlit.io/) - Python Web应用框架
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube下载工具

## 📞 反馈

如有问题或建议，欢迎通过以下方式反馈：
- GitHub Issues
- Telegram群组

---

享受你的播客！🎧
