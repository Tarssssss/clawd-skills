# 🎧 YouTube播客可视化工具 - 实现完成

## ✅ 已完成的功能

### 核心模块
1. **YouTube下载器** (`downloader.py`)
   - 使用yt-dlp下载音频
   - 提取视频描述、标题、时长等元数据
   - 支持缓存机制

2. **语音识别模块** (`transcriber.py`)
   - OpenAI Whisper语音识别（支持多种模型大小）
   - pyannote.audio说话人分离
   - 自动合并识别结果

3. **Timeline解析** (`parser.py`)
   - 从视频描述中解析时间戳
   - 支持多种时间戳格式
   - 时间戳格式化工具

4. **智能分块** (`segmenter.py`)
   - 优先使用作者timeline分块
   - 备选语义分块（按固定时间间隔）
   - 自动选择最优分块方式

5. **交互式网站** (`web_app.py`)
   - Streamlit构建的Web界面
   - 分块列表快速跳转
   - 说话人颜色区分
   - 搜索功能
   - 音频播放器

6. **CLI命令** (`cli.py`)
   - 简单的命令行接口
   - 一键处理播客
   - 自动启动网站

## 📂 文件结构

```
podcast-visualizer/
├── SKILL.md              # 技能文档
├── README.md             # 详细使用说明
├── requirements.txt      # Python依赖
├── setup.py             # 安装脚本
├── .env.example         # 环境变量示例
├── .gitignore           # Git忽略规则
└── src/
    ├── __init__.py
    ├── __main__.py
    ├── downloader.py     # YouTube下载
    ├── transcriber.py    # 语音识别 + 说话人分离
    ├── parser.py         # Timeline解析
    ├── segmenter.py      # 智能分块
    ├── web_app.py        # Streamlit网站
    └── cli.py            # CLI入口
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /root/clawd/skills/podcast-visualizer
pip install -r requirements.txt
```

### 2. 配置Hugging Face Token

pyannote.audio需要Hugging Face token：

1. 注册账号: https://huggingface.co/join
2. 生成token: https://huggingface.co/settings/tokens
3. 接受用户协议:
   - https://huggingface.co/pyannote/segmentation-3.0
   - https://huggingface.co/pyannote/speaker-diarization-3.1
4. 创建 `.env` 文件:
   ```
   HF_TOKEN=your_token_here
   ```

### 3. 运行

```bash
python -m src.cli <YouTube_URL>
```

例如：
```bash
python -m src.cli https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

处理完成后，会自动打开浏览器访问 http://localhost:8501

## 💡 使用示例

```bash
# 基本使用
python -m src.cli https://www.youtube.com/watch?v=example

# 使用小模型（更快，但准确性稍低）
python -m src.cli https://www.youtube.com/watch?v=example --model-size small

# 跳过缓存重新处理
python -m src.cli https://www.youtube.com/watch?v=example --skip-cache
```

## 🎨 网站功能

- **左侧列表**: 显示所有话题分块，点击快速跳转
- **右侧详情**: 显示选中话题的完整对话，不同说话人用不同颜色
- **底部播放器**: 内置音频播放器
- **搜索框**: 搜索关键词，快速查找相关内容
- **元信息**: 显示播客标题、频道、时长等

## 📝 技术栈

- **下载**: yt-dlp
- **语音识别**: OpenAI Whisper
- **说话人分离**: pyannote.audio
- **前端**: Streamlit
- **后端**: Python原生 + FastAPI（预留）

## ⚠️ 重要提示

1. **首次使用**:
   - Whisper medium模型约5GB，首次下载需要时间
   - pyannote.audio模型约500MB
   - 建议首次使用选择较短的视频测试

2. **性能优化**:
   - 有NVIDIA GPU会自动使用CUDA加速
   - 长视频处理时间较长，建议从小开始

3. **说话人分离**:
   - 在清晰录音上表现最好
   - 背景噪音或多人同时说话会影响准确性

## 🔧 下一步改进建议

1. **优化性能**:
   - 添加进度条显示
   - 支持断点续传
   - 并行处理

2. **增强功能**:
   - 支持导出为Markdown/PDF
   - 添加对话标注功能
   - 支持多语言识别

3. **扩展平台**:
   - Apple Podcasts支持
   - Spotify支持
   - 小宇宙支持

4. **UI优化**:
   - 添加深色模式
   - 响应式设计
   - 移动端支持

## 📞 测试建议

建议先用一个10-15分钟的YouTube视频测试完整流程：

1. 下载是否正常
2. 语音识别准确性
3. 说话人分离效果
4. Timeline解析是否正确
5. 分块逻辑是否合理
6. 网站交互是否流畅

根据测试结果进行相应调整。

---

**实现完成！** 🎉
