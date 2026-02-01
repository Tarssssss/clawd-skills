"""
Streamlit交互式网站
显示分块后的播客对话
"""

import streamlit as st
import os
import json
from typing import List, Dict
from .parser import TimelineParser


def render_segment_dialogue(dialogue: List[Dict]):
    """
    渲染对话内容

    Args:
        dialogue: 对话列表
    """
    # 说话人颜色映射
    speaker_colors = {
        'SPEAKER_00': '#e7f3ff',
        'SPEAKER_01': '#fff4e6',
        'SPEAKER_02': '#e6ffe6',
        'SPEAKER_03': '#ffe6f2',
        'UNKNOWN': '#f5f5f5',
    }

    # 动态生成颜色（如果遇到新的说话人）
    def get_speaker_color(speaker):
        if speaker in speaker_colors:
            return speaker_colors[speaker]

        # 为新说话人生成颜色
        existing_colors = list(speaker_colors.values())
        for i in range(10):
            colors = [
                '#e7f3ff', '#fff4e6', '#e6ffe6', '#ffe6f2',
                '#f0e6ff', '#e6f0ff', '#fff0e6', '#e6fff0',
            ]
            if colors[i] not in existing_colors:
                speaker_colors[speaker] = colors[i]
                return colors[i]

        return '#f5f5f5'

    for seg in dialogue:
        color = get_speaker_color(seg['speaker'])
        st.markdown(
            f'<div style="background-color: {color}; padding: 10px; border-radius: 5px; margin-bottom: 8px;">'
            f'<strong>{seg["speaker"]}</strong> '
            f'<span style="color: #666; font-size: 0.8em;">({seg["start"]:.1f}s - {seg["end"]:.1f}s)</span><br>'
            f'{seg["text"]}'
            f'</div>',
            unsafe_allow_html=True
        )


def main():
    """主函数"""
    st.set_page_config(
        page_title="播客可视化",
        page_icon="🎧",
        layout="wide"
    )

    st.title("🎧 播客可视化")

    # 从session state获取数据
    if 'segments' not in st.session_state:
        st.error("没有数据。请先使用CLI处理播客。")
        return

    segments = st.session_state['segments']
    metadata = st.session_state.get('metadata', {})
    audio_path = st.session_state.get('audio_path', '')

    # 显示元数据
    if metadata:
        st.sidebar.markdown("## 📋 播客信息")
        st.sidebar.write(f"**标题**: {metadata.get('title', 'N/A')}")
        st.sidebar.write(f"**频道**: {metadata.get('uploader', 'N/A')}")
        if metadata.get('duration'):
            minutes = metadata['duration'] // 60
            seconds = metadata['duration'] % 60
            st.sidebar.write(f"**时长**: {minutes}分{seconds}秒")
        st.sidebar.write(f"**来源**: [YouTube]({metadata.get('url', '#')})")

    # 搜索功能
    search_query = st.sidebar.text_input("🔍 搜索关键词")

    # 过滤分块
    if search_query:
        filtered_segments = []
        for seg in segments:
            # 搜索话题和对话内容
            if (search_query.lower() in seg['topic'].lower() or
                any(search_query.lower() in d['text'].lower() for d in seg['dialogue'])):
                filtered_segments.append(seg)
        segments = filtered_segments

        if not segments:
            st.warning(f"未找到包含 '{search_query}' 的内容")
            return

    # 左侧：分块列表
    st.sidebar.markdown("## 📑 话题列表")

    segment_options = []
    timeline_parser = TimelineParser()
    for i, seg in enumerate(segments):
        timestamp = timeline_parser.format_timestamp(int(seg['start']))
        segment_options.append(f"{timestamp} - {seg['topic']}")

    selected_idx = st.sidebar.selectbox(
        "选择话题",
        range(len(segment_options)),
        format_func=lambda i: segment_options[i]
    )

    # 显示选中的分块
    selected_segment = segments[selected_idx]

    # 话题标题
    st.markdown("---")
    st.markdown(f"### 📍 {timeline_parser.format_timestamp(int(selected_segment['start']))} - {selected_segment['topic']}")

    # 音频播放器
    if audio_path and os.path.exists(audio_path):
        st.audio(audio_path, format='audio/mp3')

    # 对话内容
    render_segment_dialogue(selected_segment['dialogue'])

    # 显示统计信息
    st.markdown("---")
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("话题数量", len(segments))
    with col2:
        total_words = sum(len(seg['dialogue']) for seg in segments)
        st.metric("对话片段", total_words)
    with col3:
        duration = segments[-1]['end'] - segments[0]['start'] if segments else 0
        st.metric("总时长", f"{int(duration // 60)}分{int(duration % 60)}秒")


def load_data(data_path: str, audio_path: str = None):
    """
    加载数据到session state

    Args:
        data_path: JSON数据文件路径
        audio_path: 音频文件路径
    """
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    st.session_state['segments'] = data.get('segments', [])
    st.session_state['metadata'] = data.get('metadata', {})
    st.session_state['audio_path'] = audio_path


if __name__ == '__main__':
    main()
