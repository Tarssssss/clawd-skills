#!/usr/bin/env python3
"""
导出YouTube Cookies
"""
import json
import sys

def export_chrome_cookies():
    """从Chrome导出cookies"""
    try:
        from browser_cookie3 import chrome
    except ImportError:
        print("错误: 需要安装 browser-cookie3")
        print("运行: pip install browser-cookie3")
        return None

    try:
        cookies = []
        for cookie in chrome(domain_name='youtube.com'):
            cookies.append({
                'name': cookie.name,
                'value': cookie.value,
                'domain': cookie.domain,
                'path': cookie.path,
                'expires': cookie.expires,
            })

        return cookies
    except Exception as e:
        print(f"从Chrome导出失败: {e}")
        return None

def export_firefox_cookies():
    """从Firefox导出cookies"""
    try:
        from browser_cookie3 import firefox
    except ImportError:
        print("错误: 需要安装 browser-cookie3")
        print("运行: pip install browser-cookie3")
        return None

    try:
        cookies = []
        for cookie in firefox(domain_name='youtube.com'):
            cookies.append({
                'name': cookie.name,
                'value': cookie.value,
                'domain': cookie.domain,
                'path': cookie.path,
                'expires': cookie.expires,
            })

        return cookies
    except Exception as e:
        print(f"从Firefox导出失败: {e}")
        return None

def main():
    print("=" * 60)
    print("YouTube Cookies 导出工具")
    print("=" * 60)
    print()

    # 尝试从Chrome导出
    print("📌 尝试从Chrome导出cookies...")
    chrome_cookies = export_chrome_cookies()

    if chrome_cookies:
        print(f"✓ 成功从Chrome导出 {len(chrome_cookies)} 个cookies")

        # 保存到文件
        output_file = 'youtube_cookies.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(chrome_cookies, f, indent=2, default=str)

        print(f"✓ Cookies已保存到: {output_file}")
        print(f"\n使用方法:")
        print(f"  python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies {output_file}")
        return

    # 如果Chrome失败，尝试Firefox
    print("\n📌 Chrome导出失败，尝试从Firefox导出...")
    firefox_cookies = export_firefox_cookies()

    if firefox_cookies:
        print(f"✓ 成功从Firefox导出 {len(firefox_cookies)} 个cookies")

        # 保存到文件
        output_file = 'youtube_cookies.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(firefox_cookies, f, indent=2, default=str)

        print(f"✓ Cookies已保存到: {output_file}")
        print(f"\n使用方法:")
        print(f"  python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies {output_file}")
        return

    # 如果都失败
    print("\n❌ 无法自动导出cookies")
    print("\n请手动导出cookies:")
    print("1. 在浏览器中打开 https://www.youtube.com")
    print("2. 登录你的账号")
    print("3. 使用浏览器扩展导出cookies:")
    print("   - Chrome: Get cookies.txt LOCALLY")
    print("   - Firefox: Export Cookies")
    print("4. 将导出的cookies保存为 'youtube_cookies.json' 文件")
    print("\n格式应为:")
    print("""
[
  {
    "name": "cookie_name",
    "value": "cookie_value",
    "domain": ".youtube.com",
    "path": "/",
    "expires": 1234567890
  }
]
    """)

    sys.exit(1)

if __name__ == '__main__':
    main()
