# 🎧 YouTube播客可视化工具 - 实现完成 ✅

## 📊 实现状态

| 模块 | 状态 | 说明 |
|------|------|------|
| YouTube下载器 | ✅ 完成 | 使用yt-dlp下载音频和元数据 |
| 语音识别 | ✅ 完成 | Whisper多模型支持 |
| 说话人分离 | ✅ 完成 | pyannote.audio集成 |
| Timeline解析 | ✅ 完成 | 支持多种时间戳格式 |
| 智能分块 | ✅ 完成 | 优先timeline，备选语义分块 |
| 交互式网站 | ✅ 完成 | Streamlit Web界面 |
| CLI命令 | ✅ 完成 | 一键处理播客 |
| 缓存机制 | ✅ 完成 | 自动缓存已处理视频 |

## 📁 已创建的文件

```
podcast-visualizer/
├── .env.example          # 环境变量示例
├── .gitignore           # Git忽略规则
├── SKILL.md             # 技能文档
├── README.md            # 详细使用说明
├── IMPLEMENTATION.md    # 实现完成报告
├── requirements.txt     # Python依赖
├── setup.py            # 安装脚本
└── src/
    ├── __init__.py
    ├── __main__.py
    ├── downloader.py    # YouTube下载模块
    ├── transcriber.py   # 语音识别 + 说话人分离
    ├── parser.py        # Timeline解析
    ├── segmenter.py     # 智能分块
    ├── web_app.py       # Streamlit网站
    └── cli.py           # CLI命令入口
```

## 🚀 开始使用

### 前置条件

1. **Python 3.8+**
2. **Hugging Face Token**（用于pyannote.audio）

### 快速开始（3步）

#### 步骤1: 安装依赖

```bash
cd /root/clawd/skills/podcast-visualizer
pip install -r requirements.txt
```

#### 步骤2: 配置Token

1. 注册Hugging Face: https://huggingface.co/join
2. 生成Token: https://huggingface.co/settings/tokens
3. 接受用户协议:
   - https://huggingface.co/pyannote/segmentation-3.0
   - https://huggingface.co/pyannote/speaker-diarization-3.1
4. 创建 `.env` 文件:
   ```
   HF_TOKEN=your_token_here
   ```

#### 步骤3: 运行

```bash
python -m src.cli <YouTube_URL>
```

例如：
```bash
python -m src.cli https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## 🧪 测试建议

### 测试用例1: 短播客（10-15分钟）
选择一个有清晰对话的短播客测试：
- 验证下载功能
- 验证语音识别准确性
- 验证说话人分离效果
- 验证网站交互

### 测试用例2: 带Timeline的播客
选择一个在描述中有时间戳的播客：
- 验证Timeline解析
- 验证自动分块

### 测试用例3: 长播客（30+分钟）
测试处理性能：
- 验证分段处理
- 验证缓存机制

## 💻 使用示例

### 基本使用
```bash
python -m src.cli https://www.youtube.com/watch?v=example
```

### 使用小模型（更快）
```bash
python -m src.cli https://www.youtube.com/watch?v=example --model-size small
```

### 重新处理（跳过缓存）
```bash
python -m src.cli https://www.youtube.com/watch?v=example --skip-cache
```

## 🎯 核心功能演示

### 1. 下载播客
```
📥 正在下载: https://www.youtube.com/watch?v=example
✓ 下载完成: 播客标题
  时长: 600秒
```

### 2. 语音识别
```
📝 加载Whisper模型 (medium)...
✓ Whisper模型加载完成 (设备: cuda)
📝 正在进行语音识别...
✓ 识别完成，共250个片段
```

### 3. 说话人分离
```
📝 加载说话人分离模型...
✓ 说话人分离模型加载完成 (设备: cuda)
📝 正在进行说话人分离...
✓ 说话人分离完成，共180个片段
```

### 4. 分块
```
✓ 使用作者timeline分块，共8个话题
```

### 5. 启动网站
```
🚀 启动交互式网站...
🌐 访问 http://localhost:8501 查看可视化网站
```

## 🎨 网站功能

### 左侧面板
- **话题列表**: 显示所有分块话题
- **搜索框**: 快速查找关键词

### 主界面
- **话题标题**: 显示当前选中的话题和时间范围
- **音频播放器**: 内置播放器，支持播放/暂停/进度
- **对话详情**: 完整对话，不同说话人用不同颜色区分

### 底部统计
- 话题数量
- 对话片段总数
- 总时长

## 🔍 故障排查

### 问题1: 提示"需要Hugging Face token"
**解决**: 参见"步骤2: 配置Token"

### 问题2: 识别速度很慢
**解决**:
- 使用更小的模型: `--model-size small`
- 使用GPU加速（自动检测）

### 问题3: 说话人分离不准确
**解决**:
- 确保音频清晰，无过多背景噪音
- 避免多人同时说话的场景

### 问题4: Streamlit网站无法访问
**解决**:
- 检查端口8501是否被占用
- 查看错误日志

## 📚 相关文档

- **SKILL.md**: 技能官方文档
- **README.md**: 详细使用说明
- **IMPLEMENTATION.md**: 实现完成报告

## 🔄 缓存说明

已处理的内容会缓存到 `cache/` 目录:
- `{video_id}.mp3` - 音频文件
- `{video_id}.json` - 识别结果
- `{video_id}_streamlit.json` - 网站数据

使用 `--skip-cache` 参数可以强制重新处理。

## 🎓 模型大小对比

| 模型 | 大小 | 速度 | 准确性 | 用途 |
|------|------|------|--------|------|
| tiny | 40MB | 最快 | 一般 | 快速测试 |
| base | 75MB | 快 | 较好 | 短播客 |
| small | 250MB | 中等 | 好 | 日常使用 |
| medium | 1.5GB | 中等 | 很好 | **推荐** |
| large | 3GB | 慢 | 最好 | 长播客 |

## ✨ 亮点功能

1. **一键处理**: 从URL到可视化网站，全程自动化
2. **智能分块**: 自动识别timeline，精准分块
3. **说话人分离**: 自动区分不同说话人，用颜色标记
4. **缓存机制**: 避免重复处理，提升效率
5. **搜索功能**: 快速查找关键词相关内容
6. **音频同步**: 播放音频时显示对应对话

## 🚧 已知限制

1. 首次使用需要下载大模型（约5GB）
2. 长播客处理时间较长
3. 说话人分离在噪音环境下可能不准确
4. 目前仅支持YouTube

## 🔮 未来计划

- [ ] 支持Apple Podcasts、Spotify、小宇宙
- [ ] 优化说话人分离准确性
- [ ] 支持导出为Markdown/PDF
- [ ] 添加对话标注功能
- [ ] 支持多语言识别
- [ ] 云端部署方案

---

## 📞 反馈

如有问题或建议，请随时反馈！

**实现完成时间**: 2026-01-31
**版本**: v0.1.0

🎉 **开始使用吧！**
