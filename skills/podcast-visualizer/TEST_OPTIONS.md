# 🧪 测试视频推荐

## 方式1: 使用本地音频文件（最简单、最可靠）⭐ 推荐

**为什么推荐：**
- ✅ 无需YouTube验证
- ✅ 无需cookies
- ✅ 可以处理任何音频
- ✅ 可以测试完整流程

**步骤：**
1. 在电脑上下载任意播客音频（MP3）
2. 上传到服务器：
   ```bash
   scp podcast.mp3 root@server:/root/clawd/skills/podcast-visualizer/
   ```
3. 运行：
   ```bash
   cd /root/clawd/skills/podcast-visualizer
   python3 -m podcast_visualizer.cli_new --audio podcast.mp3 --model-size small
   ```

## 方式2: 尝试TED视频

我尝试测试一个TED视频（通常不需要登录）：

### 测试视频：TED Talk
**URL**: https://www.youtube.com/watch?v=Ks-_Mh1IhE
**标题**: How to make work that works for you
**时长**: 约10分钟

运行：
```bash
cd /root/clawd/skills/podcast-visualizer
python3 -m podcast_visualizer.cli_new --url https://www.youtube.com/watch?v=Ks-_Mh1IhE --model-size small
```

## 方式3: 重新导出cookies

如果你想测试Huberman Lab视频：

1. **在浏览器中登录YouTube**
2. **访问**: https://www.youtube.com/watch?v=fSBgDq2ttCw
3. **确认登录成功**
4. **立即导出cookies**（使用"Get cookies.txt LOCALLY"扩展）
5. **上传到服务器**:
   ```bash
   scp cookies.txt root@server:/root/clawd/skills/podcast-visualizer/youtube_cookies.txt
   ```
6. **运行**:
   ```bash
   python3 -m podcast_visualizer.cli_new --url https://www.youtube.com/watch?v=fSBgDq2ttCw --cookies youtube_cookies.txt
   ```

## ⚠️ 重要提醒

关于cookies：
- Cookies有时效性（几小时到几天）
- 导出后需要立即使用
- 旧cookies会失效

## 💡 我的建议

**最快、最可靠的方式是方式1**：
1. 用你电脑下载一个10-15分钟的播客
2. 上传到服务器
3. 运行处理命令

这样可以：
- ✅ 立即测试所有功能
- ✅ 无需处理YouTube验证
- ✅ 可以多次测试调整

---

你想用哪个方式测试？
1. **方式1** - 本地音频（推荐）
2. **方式2** - TED视频测试
3. **方式3** - 重新导出cookies测试Huberman
