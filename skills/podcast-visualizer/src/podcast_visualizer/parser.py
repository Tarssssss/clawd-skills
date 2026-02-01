"""
Timeline解析模块
从视频描述中提取时间戳和话题
"""

import re
from typing import List, Dict, Optional


class TimelineParser:
    """Timeline解析器"""

    def __init__(self):
        # 时间戳正则表达式
        self.timestamp_patterns = [
            # 格式: 00:00 - 话题
            r'(\d{1,2}):(\d{2})\s*[-–—]\s*(.+?)(?=\n|$)',
            # 格式: 00:00 话题
            r'(\d{1,2}):(\d{2})\s+(.+?)(?=\n|$)',
            # 格式: 00:00:00 - 话题
            r'(\d{1,2}):(\d{2}):(\d{2})\s*[-–—]\s*(.+?)(?=\n|$)',
            # 格式: 00:00:00 话题
            r'(\d{1,2}):(\d{2}):(\d{2})\s+(.+?)(?=\n|$)',
            # 格式: (00:00) 话题
            r'\((\d{1,2}):(\d{2})\)\s*(.+?)(?=\n|$)',
            # 格式: [00:00] 话题
            r'\[(\d{1,2}):(\d{2})\]\s*(.+?)(?=\n|$)',
        ]

    def parse(self, description: str) -> List[Dict]:
        """
        从描述中解析timeline

        Args:
            description: 视频描述文本

        Returns:
            timeline列表，每个元素包含start, end, topic
        """
        if not description:
            return []

        timeline = []

        # 按行分割
        lines = description.split('\n')

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # 尝试匹配各种时间戳格式
            for pattern in self.timestamp_patterns:
                match = re.search(pattern, line)
                if match:
                    groups = match.groups()

                    # 解析时间戳
                    if len(groups) == 3:  # HH:MM:SS 或 MM:SS
                        hours = 0
                        minutes = int(groups[0])
                        seconds = int(groups[1])
                        topic = groups[2]
                    else:  # HH:MM:SS
                        hours = int(groups[0])
                        minutes = int(groups[1])
                        seconds = int(groups[2])
                        topic = groups[3]

                    start_seconds = hours * 3600 + minutes * 60 + seconds

                    timeline.append({
                        'start': start_seconds,
                        'topic': topic.strip(),
                        'raw_line': line,
                    })

                    break  # 只使用第一个匹配的模式

        # 按时间排序
        timeline.sort(key=lambda x: x['start'])

        # 计算每个话题的结束时间
        for i in range(len(timeline)):
            if i < len(timeline) - 1:
                timeline[i]['end'] = timeline[i + 1]['start']
            else:
                # 最后一个话题，假设持续到视频结束（稍后会根据实际时长调整）
                timeline[i]['end'] = None

        return timeline

    def format_timestamp(self, seconds: int) -> str:
        """
        将秒数格式化为时间戳字符串

        Args:
            seconds: 秒数

        Returns:
            格式化的时间戳 (MM:SS 或 HH:MM:SS)
        """
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60

        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{secs:02d}"
        else:
            return f"{minutes:02d}:{secs:02d}"
