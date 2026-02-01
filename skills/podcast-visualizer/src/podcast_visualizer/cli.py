"""Podcast Visualizer - CLI入口"""

import argparse
import os
import sys
import json
import subprocess
from pathlib import Path

# 导入模块
from .downloader import YouTubeDownloader
from .transcriber import TranscriberWithSpeaker
from .segmenter import Segmenter


def process_podcast(url: str, model_size: str = "medium", skip_cache: bool = False, cookies_path: str = None):
    """
    处理播客

    Args:
        url: YouTube URL
        model_size: Whisper模型大小
        skip_cache: 是否跳过缓存
        cookies_path: Cookies文件路径
    """
    print("=" * 60)
    print("🎧 播客可视化工具")
    print("=" * 60)

    # 初始化下载器
    downloader = YouTubeDownloader(cache_dir="/root/clawd/skills/podcast-visualizer/cache", cookies_path=cookies_path)

    # 下载音频
    download_result = downloader.download_audio(url, skip_cache=skip_cache)
    audio_path = download_result['audio_path']
    metadata = download_result['metadata']
    video_id = download_result['video_id']

    # 检查识别结果缓存
    result_path = os.path.join("/root/clawd/skills/podcast-visualizer/cache", f"{video_id}.json")

    if os.path.exists(result_path) and not skip_cache:
        print(f"✓ 使用缓存的识别结果")
        with open(result_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            transcription = data.get('transcription', [])
            segments = data.get('segments', [])
    else:
        # 初始化识别器
        transcriber = TranscriberWithSpeaker(model_size=model_size)

        # 语音识别 + 说话人分离
        transcription = transcriber.process(audio_path)

        # 分块
        segmenter = Segmenter()
        segments = segmenter.segment(
            description=metadata.get('description', ''),
            transcription=transcription,
            duration=metadata.get('duration', 0)
        )

        # 保存结果
        data = {
            'metadata': metadata,
            'transcription': transcription,
            'segments': segments,
        }
        with open(result_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✓ 结果已保存到: {result_path}")

    # 保存Streamlit数据文件
    streamlit_data_path = os.path.join("/root/clawd/skills/podcast-visualizer/cache", f"{video_id}_streamlit.json")
    streamlit_data = {
        'segments': segments,
        'metadata': metadata,
    }
    with open(streamlit_data_path, 'w', encoding='utf-8') as f:
        json.dump(streamlit_data, f, ensure_ascii=False, indent=2)

    # 启动Streamlit网站
    print("\n" + "=" * 60)
    print("🚀 启动交互式网站...")
    print("=" * 60)

    # 创建Streamlit启动脚本
    script_content = f'''
import sys
import os
import json

sys.path.insert(0, os.path.dirname(__file__))

from podcast_visualizer.web_app import load_data, main

data_path = "{streamlit_data_path}"
audio_path = "{audio_path}"

load_data(data_path, audio_path)
main()
'''

    script_path = os.path.join("/root/clawd/skills/podcast-visualizer/cache", f"{video_id}_app.py")
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script_content)

    # 启动Streamlit
    print("\n🌐 访问 http://localhost:8501 查看可视化网站")
    print("按 Ctrl+C 停止服务\n")

    subprocess.run([
        "streamlit", "run", script_path,
        "--server.port", "8501",
        "--server.headless", "true",
    ])


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="YouTube播客可视化工具 - 将播客转换为可交互的文字稿网站"
    )
    parser.add_argument(
        "url",
        help="YouTube视频URL"
    )
    parser.add_argument(
        "--model-size",
        default="medium",
        choices=["tiny", "base", "small", "medium", "large"],
        help="Whisper模型大小 (默认: medium)"
    )
    parser.add_argument(
        "--skip-cache",
        action="store_true",
        help="跳过缓存，重新处理"
    )
    parser.add_argument(
        "--cookies",
        help="YouTube cookies文件路径（用于需要登录的视频）"
    )

    args = parser.parse_args()

    try:
        process_podcast(
            url=args.url,
            model_size=args.model_size,
            skip_cache=args.skip_cache,
            cookies_path=args.cookies
        )
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
