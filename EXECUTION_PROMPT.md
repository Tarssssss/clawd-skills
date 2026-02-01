# 执行 Prompt

> 使用 CLARIFICATION_PROTOCOL v1.0 生成

## 任务目标

构建一个YouTube播客可视化skill，能够：
1. 从YouTube URL获取音频和描述信息
2. 使用Whisper进行语音识别，使用pyannote.audio进行说话人分离
3. 根据video description中的timeline或智能分块算法将对话分块
4. 生成交互式网站，用户可以浏览分块对话，播放音频并高亮当前播放位置
5. 封装为CLI命令：`podcast-visualize <youtube_url>`

## 技术要求

### 核心库
- `yt-dlp`：YouTube内容下载
- `openai-whisper`：语音识别
- `pyannote.audio`：说话人分离
- `fastapi`：后端API
- `streamlit`：前端交互界面（或纯HTML+JS）

### 目录结构
```
skills/podcast-visualizer/
├── SKILL.md
├── setup.py
├── requirements.txt
├── src/
│   ├── __init__.py
│   ├── downloader.py      # YouTube下载模块
│   ├── transcriber.py     # Whisper + pyannote模块
│   ├── parser.py          # Timeline解析模块
│   ├── segmenter.py       # 智能分块模块
│   ├── web_app.py         # Streamlit/HTML网站
│   └── cli.py             # CLI命令入口
├── cache/                 # 缓存已处理的视频
└── templates/             # 网站模板（如果用纯HTML）
```

### 实现步骤

#### 1. 环境准备
- 创建skill目录结构
- 编写requirements.txt
- 设置pyannote.audio的Hugging Face token

#### 2. 下载模块（downloader.py）
- 使用yt-dlp下载音频
- 提取视频描述、标题、时长等元数据
- 保存元数据为JSON

#### 3. 语音识别模块（transcriber.py）
- Whisper medium模型识别
- pyannote.audio分离说话人
- 合并为统一格式：`[{"start": 0, "end": 5, "speaker": "SPEAKER_00", "text": "..."}]`
- 支持长音频分段处理

#### 4. Timeline解析模块（parser.py）
- 正则匹配video description中的时间戳
- 格式：`(\d{1,2}):(\d{2})` 或 `(\d{1,2}):(\d{2}):(\d{2})`
- 解析为结构化数据

#### 5. 智能分块模块（segmenter.py）
- 优先使用解析出的timeline
- 如果没有timeline，实现语义分割
- 初级版本：基于关键词聚类
- 高级版本：使用轻量级LLM分析

#### 6. 网站模块（web_app.py）
- 使用Streamlit构建交互界面
- 左侧：分块列表（可点击跳转）
- 右侧：详细对话（区分说话人颜色）
- 底部：音频播放器 + 时间轴高亮
- 搜索框：搜索关键词

#### 7. CLI入口（cli.py）
- 命令：`podcast-visualize <youtube_url>`
- 流程：下载 → 识别 → 分块 → 启动网站
- 显示浏览器URL：`http://localhost:8501`
- 支持缓存检查

#### 8. 缓存机制
- 使用YouTube video ID作为缓存键
- 缓存音频文件和识别结果
- 避免重复处理

### 测试验证

- 使用一个10-20分钟的YouTube视频测试完整流程
- 验证说话人分离准确性
- 验证timeline解析正确性
- 验证分块逻辑
- 验证网站交互体验

### 交付物

- 完整的skill代码
- SKILL.md文档（使用说明）
- requirements.txt
- 一个演示视频的使用示例

## 注意事项

- pyannote.audio需要Hugging Face token和用户协议接受
- Whisper medium模型需要约5GB磁盘空间
- 长播客（>30分钟）需要分段处理
- 网站初始使用Streamlit，未来可考虑更轻量的纯HTML方案
- 优先实现核心功能，UI可以迭代优化
