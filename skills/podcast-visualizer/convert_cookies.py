#!/usr/bin/env python3
"""
将Netscape格式的cookies转换为JSON格式
"""

import json
import sys


def convert_netscape_to_json(input_file, output_file):
    """
    转换Netscape cookies到JSON格式

    Args:
        input_file: 输入文件（Netscape格式）
        output_file: 输出文件（JSON格式）
    """
    cookies = []

    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()

            # 跳过注释和空行
            if not line or line.startswith('#'):
                continue

            # 解析行（制表符分隔）
            parts = line.split('\t')

            if len(parts) >= 7:
                # Netscape格式: domain, path, secure, expires, name, value
                cookie = {
                    'name': parts[5],
                    'value': parts[6],
                    'domain': parts[0],
                    'path': parts[1],
                    'expires': int(parts[3]) if parts[3].isdigit() else None,
                }

                cookies.append(cookie)

    # 保存为JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cookies, f, indent=2)

    return cookies


if __name__ == '__main__':
    input_file = '/root/.clawdbot/media/inbound/59df8192-d528-4c91-af6a-195d9f74c4f9.txt'
    output_file = '/root/clawd/skills/podcast-visualizer/youtube_cookies.json'

    print("🍪 转换cookies格式...")
    print(f"输入: {input_file}")
    print(f"输出: {output_file}")
    print()

    try:
        cookies = convert_netscape_to_json(input_file, output_file)
        print(f"✓ 成功转换 {len(cookies)} 个cookies")
        print(f"✓ 保存到: {output_file}")
        print()
        print("使用方法:")
        print("  python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies youtube_cookies.json")
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
