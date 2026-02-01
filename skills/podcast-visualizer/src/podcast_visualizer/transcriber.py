"""
语音识别和说话人分离模块
使用Whisper进行语音识别，pyannote.audio进行说话人分离
"""

import os
import json
import torch
from typing import List, Dict
from tqdm import tqdm
import whisper
from pyannote.audio import Pipeline
from dotenv import load_dotenv

load_dotenv()


class Transcriber:
    """语音识别器"""

    def __init__(self, model_size: str = "medium", device: str = None):
        """
        初始化语音识别器

        Args:
            model_size: Whisper模型大小 (tiny, base, small, medium, large)
            device: 使用的设备 (cuda/cpu)
        """
        self.model_size = model_size
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        print(f"📝 加载Whisper模型 ({model_size})...")
        self.model = whisper.load_model(model_size, device=self.device)
        print(f"✓ Whisper模型加载完成 (设备: {self.device})")

    def transcribe(self, audio_path: str) -> List[Dict]:
        """
        语音识别

        Args:
            audio_path: 音频文件路径

        Returns:
            识别结果列表，每个元素包含start, end, text
        """
        print(f"📝 正在进行语音识别...")
        result = self.model.transcribe(
            audio_path,
            language=None,  # 自动检测语言
            task="transcribe",
            word_timestamps=True,  # 获取词级时间戳
        )

        segments = []
        for seg in result['segments']:
            segments.append({
                'start': seg['start'],
                'end': seg['end'],
                'text': seg['text'].strip(),
            })

        print(f"✓ 识别完成，共{len(segments)}个片段")
        return segments


class SpeakerDiarization:
    """说话人分离器"""

    def __init__(self, hf_token: str = None):
        """
        初始化说话人分离器

        Args:
            hf_token: Hugging Face token
        """
        self.hf_token = hf_token or os.getenv('HF_TOKEN')

        if not self.hf_token:
            raise ValueError(
                "需要Hugging Face token。请设置HF_TOKEN环境变量或传入hf_token参数。\n"
                "1. 注册Hugging Face账号: https://huggingface.co/join\n"
                "2. 生成token: https://huggingface.co/settings/tokens\n"
                "3. 接受用户协议: https://huggingface.co/pyannote/speaker-diarization-3.1"
            )

        print("📝 加载说话人分离模型...")
        self.pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=self.hf_token,
        )

        # 将pipeline移动到GPU（如果可用）
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.pipeline = self.pipeline.to(device)
        print(f"✓ 说话人分离模型加载完成 (设备: {device})")

    def diarize(self, audio_path: str) -> List[Dict]:
        """
        说话人分离

        Args:
            audio_path: 音频文件路径

        Returns:
            说话人结果列表，每个元素包含start, end, speaker
        """
        print("📝 正在进行说话人分离...")
        diarization = self.pipeline(audio_path)

        speakers = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            speakers.append({
                'start': float(turn.start),
                'end': float(turn.end),
                'speaker': speaker,
            })

        print(f"✓ 说话人分离完成，共{len(speakers)}个片段")
        return speakers


class TranscriberWithSpeaker:
    """语音识别 + 说话人分离"""

    def __init__(self, model_size: str = "medium", hf_token: str = None):
        """
        初始化

        Args:
            model_size: Whisper模型大小
            hf_token: Hugging Face token
        """
        self.transcriber = Transcriber(model_size=model_size)
        self.diarization = SpeakerDiarization(hf_token=hf_token)

    def process(self, audio_path: str) -> List[Dict]:
        """
        处理音频，返回带说话人标签的文字稿

        Args:
            audio_path: 音频文件路径

        Returns:
            文字稿列表，每个元素包含start, end, speaker, text
        """
        # 语音识别
        transcription = self.transcriber.transcribe(audio_path)

        # 说话人分离
        speakers = self.diarization.diarize(audio_path)

        # 合并结果
        result = []
        for seg in tqdm(transcription, desc="合并识别结果"):
            # 找到与当前文字片段重叠最多的说话人片段
            best_speaker = None
            max_overlap = 0

            for speaker in speakers:
                # 计算重叠时间
                overlap_start = max(seg['start'], speaker['start'])
                overlap_end = min(seg['end'], speaker['end'])
                overlap = max(0, overlap_end - overlap_start)

                if overlap > max_overlap:
                    max_overlap = overlap
                    best_speaker = speaker['speaker']

            result.append({
                'start': seg['start'],
                'end': seg['end'],
                'speaker': best_speaker or 'UNKNOWN',
                'text': seg['text'],
            })

        return result

    def save_result(self, result: List[Dict], output_path: str):
        """
        保存结果到JSON文件

        Args:
            result: 处理结果
            output_path: 输出文件路径
        """
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"✓ 结果已保存到: {output_path}")

    def load_result(self, input_path: str) -> List[Dict]:
        """
        从JSON文件加载结果

        Args:
            input_path: 输入文件路径

        Returns:
            处理结果
        """
        with open(input_path, 'r', encoding='utf-8') as f:
            return json.load(f)
