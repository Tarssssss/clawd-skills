"""
智能分块模块
根据timeline或语义分析将对话分块
"""

from typing import List, Dict, Optional
from .parser import TimelineParser


class Segmenter:
    """对话分块器"""

    def __init__(self):
        self.timeline_parser = TimelineParser()

    def segment_by_timeline(self, description: str, transcription: List[Dict], duration: int) -> List[Dict]:
        """
        根据timeline分块

        Args:
            description: 视频描述
            transcription: 语音识别结果
            duration: 音频总时长（秒）

        Returns:
            分块列表，每个元素包含start, end, topic, dialogue
        """
        # 解析timeline
        timeline = self.timeline_parser.parse(description)

        if not timeline:
            return self.segment_by_semantic(transcription)

        # 更新最后一个话题的结束时间
        if timeline and timeline[-1]['end'] is None:
            timeline[-1]['end'] = duration

        # 根据timeline分配对话片段
        segments = []

        for topic in timeline:
            # 找到在这个时间范围内的所有对话
            dialogue = [
                seg for seg in transcription
                if seg['start'] >= topic['start'] and seg['end'] <= topic['end']
            ]

            segments.append({
                'start': topic['start'],
                'end': topic['end'],
                'topic': topic['topic'],
                'dialogue': dialogue,
            })

        return segments

    def segment_by_semantic(self, transcription: List[Dict], segment_duration: int = 600) -> List[Dict]:
        """
        根据语义分块（简单版本：按固定时间间隔分块）

        Args:
            transcription: 语音识别结果
            segment_duration: 每块的时长（秒），默认10分钟

        Returns:
            分块列表
        """
        if not transcription:
            return []

        segments = []
        total_duration = transcription[-1]['end']

        current_segment = []
        segment_start = 0
        segment_num = 1

        for seg in transcription:
            # 如果当前段超过设定时长，保存并开始新段
            if seg['end'] - segment_start >= segment_duration:
                if current_segment:
                    segments.append({
                        'start': segment_start,
                        'end': seg['start'],
                        'topic': f'话题 {segment_num}',
                        'dialogue': current_segment,
                    })
                    segment_num += 1

                segment_start = seg['start']
                current_segment = [seg]
            else:
                current_segment.append(seg)

        # 添加最后一段
        if current_segment:
            segments.append({
                'start': segment_start,
                'end': transcription[-1]['end'],
                'topic': f'话题 {segment_num}',
                'dialogue': current_segment,
            })

        return segments

    def segment(self, description: Optional[str], transcription: List[Dict], duration: int) -> List[Dict]:
        """
        自动选择分块方式

        Args:
            description: 视频描述
            transcription: 语音识别结果
            duration: 音频总时长（秒）

        Returns:
            分块列表
        """
        # 尝试用timeline分块
        timeline = self.timeline_parser.parse(description)

        if timeline and len(timeline) >= 2:
            print(f"✓ 使用作者timeline分块，共{len(timeline)}个话题")
            return self.segment_by_timeline(description, transcription, duration)
        else:
            print(f"✓ 未找到timeline，使用语义分块")
            return self.segment_by_semantic(transcription)
