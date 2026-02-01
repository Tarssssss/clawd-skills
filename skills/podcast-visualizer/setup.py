from setuptools import setup, find_packages

setup(
    name="podcast-visualizer",
    version="0.1.0",
    description="YouTube播客可视化工具 - 将播客转换为可交互的文字稿网站",
    author="Clawdbot",
    python_requires=">=3.8",
    packages=find_packages(),
    install_requires=[
        "yt-dlp>=2023.11.16",
        "openai-whisper>=20231117",
        "pyannote.audio>=3.1.1",
        "torch>=2.1.0",
        "torchaudio>=2.1.0",
        "fastapi>=0.104.0",
        "uvicorn>=0.24.0",
        "streamlit>=1.28.0",
        "pydantic>=2.5.0",
        "python-dotenv>=1.0.0",
        "tqdm>=4.66.0",
        "pyyaml>=6.0",
    ],
    entry_points={
        "console_scripts": [
            "podcast-visualizer=podcast_visualizer.cli:main",
        ],
    },
)
