#!/usr/bin/env python3
"""
简单的测试脚本 - 使用Deno JS运行时
"""
import sys
import os
sys.path.insert(0, '/root/clawd/skills/podcast-visualizer/src')

from downloader import YouTubeDownloader
import yt_dlp

# 测试下载
url = "https://www.youtube.com/watch?v=HiyzzcuaAac"

print("=" * 60)
print("测试YouTube下载功能（带JS运行时）")
print("=" * 60)

# 配置yt-dlp使用Deno
ydl_opts = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'outtmpl': '/root/clawd/skills/podcast-visualizer/cache/%(id)s.%(ext)s',
    'quiet': False,
    'no_warnings': False,
    'js_runtime': 'deno',
}

try:
    print(f"📥 正在下载: {url}")
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    print("\n✅ 下载成功!")
    print(f"标题: {info.get('title', 'N/A')}")
    print(f"时长: {info.get('duration', 0)}秒")
    print(f"频道: {info.get('uploader', 'N/A')}")

    # 显示前500个字符的描述
    desc = info.get('description', '')
    print(f"\n描述预览（前500字符）:")
    print(desc[:500])

    # 保存元数据
    video_id = info.get('id', '')
    if video_id:
        metadata_path = f"/root/clawd/skills/podcast-visualizer/cache/{video_id}.metadata.json"
        import json
        metadata = {
            "title": info.get('title', ''),
            "description": info.get('description', ''),
            "uploader": info.get('uploader', ''),
            "duration": info.get('duration', 0),
            "upload_date": info.get('upload_date', ''),
            "view_count": info.get('view_count', 0),
            "video_id": video_id,
            "url": url,
        }
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        print(f"\n✓ 元数据已保存到: {metadata_path}")

except Exception as e:
    print(f"\n❌ 错误: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
