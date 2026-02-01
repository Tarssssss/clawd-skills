# 🎧 测试视频 - Huberman Lab Essentials

## 推荐测试视频

### 视频1: How Hearing & Balance Enhance Focus & Learning（最新）
- **URL**: https://www.youtube.com/watch?v=fSBgDq2ttCw
- **发布时间**: 2025年5月
- **时长**: 约1小时
- **主题**: 听觉和前庭系统如何增强学习和专注力

### 视频2: How to Learn Faster by Using Failures, Movement & Balance
- **URL**: https://www.youtube.com/watch?v=jwChiek_aRY
- **发布时间**: 2024年12月
- **时长**: 约1小时
- **主题**: 如何通过失败、运动和平衡来加速学习

### 视频3: Huberman Lab Essentials播放列表
- **URL**: https://www.youtube.com/playlist?list=PLPNW_gerXa4Pc8S2qoUQc5e8Ir97RLuVW
- **说明**: 完整的Essentials系列播放列表

## 🚀 测试命令

### 测试最新视频（推荐）
```bash
cd /root/clawd/skills/podcast-visualizer
python3 -m src.cli https://www.youtube.com/watch?v=fSBgDq2ttCw
```

### 测试另一个视频
```bash
cd /root/clawd/skills/podcast-visualizer
python3 -m src.cli https://www.youtube.com/watch?v=jwChiek_aRY
```

## 📋 测试内容

这些视频应该可以测试：
- ✅ YouTube下载功能
- ✅ Whisper语音识别（长时间，约1小时）
- ✅ pyannote.audio说话人分离（单人播客）
- ✅ Timeline解析（如果有描述中的时间戳）
- ✅ 智能分块
- ✅ Streamlit可视化网站

## ⚠️ 注意事项

1. **首次运行会下载Whisper模型**（约5GB）
2. **长时间视频处理时间较长**（约1小时视频可能需要20-40分钟）
3. **需要先完成依赖安装**（whisper和pyannote.audio）

## 💡 建议

由于这些视频较长（约1小时），如果你想快速测试：
- 可以选择一个较短的Huberman Lab播客（15-30分钟）
- 或者选择其他较短的播客视频

你想用哪个视频测试？
