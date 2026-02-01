#!/usr/bin/env python3
"""
测试YouTube下载（使用Netscape格式cookies）
"""
import sys
sys.path.insert(0, '/root/clawd/skills/podcast-visualizer/src')

from downloader import YouTubeDownloader

# 测试下载
url = "https://www.youtube.com/watch?v=HiyzzcuaAac"

print("=" * 60)
print("测试YouTube下载功能（Netscape格式cookies）")
print("=" * 60)

# 使用cookies初始化下载器（使用.txt文件）
cookies_path = '/root/clawd/skills/podcast-visualizer/youtube_cookies.txt'
downloader = YouTubeDownloader(cache_dir="/root/clawd/skills/podcast-visualizer/cache", cookies_path=cookies_path)

try:
    result = downloader.download_audio(url)
    print("\n✅ 下载成功!")
    print(f"视频ID: {result['video_id']}")
    print(f"音频路径: {result['audio_path']}")
    print(f"标题: {result['metadata']['title']}")
    print(f"时长: {result['metadata']['duration']}秒")
    print(f"频道: {result['metadata']['uploader']}")

    # 显示前500个字符的描述
    desc = result['metadata'].get('description', '')
    print(f"\n描述预览（前500字符）:")
    print(desc[:500])

except Exception as e:
    print(f"\n❌ 错误: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
