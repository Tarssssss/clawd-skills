"""
YouTube下载模块
使用yt-dlp下载音频和提取元数据
"""

import os
import json
import re
from typing import Dict, Optional
import yt_dlp


def extract_video_id(url: str) -> Optional[str]:
    """从YouTube URL中提取video ID"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'(?:youtube\.com\/watch\?.*v=)([^&\n?#]+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    return None


class YouTubeDownloader:
    """YouTube下载器"""

    def __init__(self, cache_dir: str = "./cache", cookies_path: str = None):
        self.cache_dir = cache_dir
        self.cookies_path = cookies_path
        os.makedirs(cache_dir, exist_ok=True)

    def download_audio(self, url: str, skip_cache: bool = False) -> Dict:
        """
        下载YouTube音频

        Args:
            url: YouTube视频URL
            skip_cache: 是否跳过缓存

        Returns:
            包含音频路径和元数据的字典
        """
        video_id = extract_video_id(url)
        if not video_id:
            raise ValueError(f"无法从URL中提取video ID: {url}")

        audio_path = os.path.join(self.cache_dir, f"{video_id}.mp3")
        metadata_path = os.path.join(self.cache_dir, f"{video_id}.metadata.json")

        # 检查缓存
        if not skip_cache and os.path.exists(audio_path) and os.path.exists(metadata_path):
            print(f"✓ 使用缓存: {video_id}")
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            return {
                "audio_path": audio_path,
                "metadata": metadata,
                "video_id": video_id,
            }

        # 下载配置
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(self.cache_dir, f'{video_id}.%(ext)s'),
            'quiet': False,
            'no_warnings': False,
            # 额外参数尝试绕过机器人检测
            'nocheckcertificate': True,
            'ignoreerrors': False,
            'no_warnings': False,
        }

        # 添加cookies（如果提供）
        if self.cookies_path:
            ydl_opts['cookiefile'] = self.cookies_path
            print(f"🍪 使用cookies: {self.cookies_path}")
            # 打印一些cookie信息用于调试
            if os.path.exists(self.cookies_path):
                with open(self.cookies_path, 'r') as f:
                    lines = f.readlines()
                    # 过滤掉注释和空行
                    cookie_lines = [line for line in lines if line.strip() and not line.strip().startswith('#')]
                    print(f"  找到 {len(cookie_lines)} 个cookies")

        print(f"📥 正在下载: {url}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)

        # 提取元数据
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

        # 保存元数据
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        print(f"✓ 下载完成: {metadata['title']}")
        print(f"  时长: {metadata['duration']}秒")

        return {
            "audio_path": audio_path,
            "metadata": metadata,
            "video_id": video_id,
        }
