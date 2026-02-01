#!/usr/bin/env python3
"""
使用Playwright + Xvfb自动获取YouTube Cookies
在无图形界面环境中使用虚拟显示
"""

import asyncio
import json
import subprocess
import os
import sys
from playwright.async_api import async_playwright


class DisplayManager:
    """管理虚拟显示"""

    def __init__(self, display_number=99):
        self.display_number = display_number
        self.display = f":{display_number}"
        self.process = None

    def start(self):
        """启动Xvfb虚拟显示"""
        print(f"🖥️  启动虚拟显示 {self.display}...")
        self.process = subprocess.Popen([
            'Xvfb', self.display,
            '-screen', '0', '1920x1080x24',
            '-ac',
            '+extension', 'GLX',
            '+render',
            '-noreset'
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # 设置DISPLAY环境变量
        os.environ['DISPLAY'] = self.display

        # 等待Xvfb启动
        import time
        time.sleep(2)

        print("✓ 虚拟显示已启动")
        return self

    def stop(self):
        """停止虚拟显示"""
        if self.process:
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
            print("✓ 虚拟显示已停止")


async def get_youtube_cookies_interactive():
    """
    使用浏览器（无headless）获取cookies，需要用户在另一个终端中查看
    """
    print("=" * 60)
    print("YouTube Cookies 获取工具 (Playwright + VNC)")
    print("=" * 60)
    print()

    # 启动虚拟显示
    display_manager = DisplayManager(display_number=99)
    display_manager.start()

    try:
        async with async_playwright() as p:
            # 启动Chromium浏览器（非headless模式）
            print("🌐 正在启动浏览器...")
            browser = await p.chromium.launch(
                headless=False,  # 显示浏览器窗口
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    f'--display={display_manager.display}',
                ]
            )

            # 创建新上下文
            context = await browser.new_context()

            # 创建新页面
            page = await context.new_page()

            # 打开YouTube
            print("📺 打开YouTube...")
            await page.goto('https://www.youtube.com', wait_until='networkidle')

            print()
            print("=" * 60)
            print("❗ 注意事项")
            print("=" * 60)
            print("浏览器已在虚拟显示中启动，但你看不到界面")
            print()
            print("如果你需要看到浏览器界面，请使用VNC:")
            print(f"1. 安装VNC客户端")
            print(f"2. 连接到服务器: VNC localhost:5999")
            print(f"   (display 99 = 端口 5900+99 = 5999)")
            print()
            print("或者使用更简单的方法:")
            print("1. 在你的本地浏览器中登录YouTube")
            print("2. 使用浏览器扩展导出cookies")
            print("3. 将cookies文件上传到服务器")
            print()
            print("详细步骤请参考: COOKIES_GUIDE.md")
            print("=" * 60)
            print()

            # 等待用户确认（但实际上用户看不到界面）
            print("由于无法看到浏览器界面，建议使用替代方案")
            print("输入 'skip' 跳过，或者按 Enter 尝试继续...")

            user_input = input("> ")

            if user_input.lower() == 'skip':
                print("\n已跳过，请使用手动导出cookies的方法")
                return False

            # 如果用户坚持继续，尝试获取cookies
            print()
            print("🍪 正在获取cookies...")
            cookies = await context.cookies()

            # 过滤YouTube相关的cookies
            youtube_cookies = [
                {
                    'name': cookie['name'],
                    'value': cookie['value'],
                    'domain': cookie['domain'],
                    'path': cookie['path'],
                    'expires': cookie.get('expires', None),
                }
                for cookie in cookies
                if 'youtube' in cookie.get('domain', '')
            ]

            print(f"✓ 获取到 {len(youtube_cookies)} 个YouTube cookies")

            if len(youtube_cookies) == 0:
                print("❌ 警告: 没有获取到YouTube cookies")
                print("可能的原因:")
                print("- 没有在浏览器中登录YouTube")
                print("- 浏览器还没有加载YouTube页面")
                print()

            # 保存到文件
            output_file = 'youtube_cookies.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(youtube_cookies, f, indent=2)

            print(f"✓ Cookies已保存到: {output_file}")
            print()
            print("使用方法:")
            print(f"  python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies {output_file}")

            # 关闭浏览器
            await browser.close()

            return True

    finally:
        # 停止虚拟显示
        display_manager.stop()


def main():
    """主函数"""

    print("检测到没有图形界面环境")
    print()
    print("你有以下选择:")
    print()
    print("1. 使用VNC查看浏览器界面（需要安装VNC客户端）")
    print("2. 使用手动导出cookies的方法（推荐，更简单）")
    print("   详细步骤请参考: COOKIES_GUIDE.md")
    print()
    print("选择:")
    print("  输入 'vnc' - 使用VNC方式")
    print("  输入 'manual' - 查看手动导出步骤")
    print()

    choice = input("请选择 (vnc/manual): ").strip().lower()

    if choice == 'vnc':
        print()
        print("启动VNC方式...")
        success = asyncio.run(get_youtube_cookies_interactive())
        if not success:
            print("\n请使用手动导出cookies的方法")
            sys.exit(1)
    elif choice == 'manual':
        print()
        print("请参考 COOKIES_GUIDE.md 文件中的手动导出步骤")
        print()
        print("简要步骤:")
        print("1. 在你的本地浏览器中登录YouTube")
        print("2. 安装浏览器扩展: 'Get cookies.txt LOCALLY' (Chrome) 或 'Cookie Editor' (Firefox)")
        print("3. 导出cookies为JSON格式")
        print("4. 将cookies文件上传到服务器: /root/clawd/skills/podcast-visualizer/youtube_cookies.json")
        print("5. 运行: python3 -m src.cli <URL> --cookies youtube_cookies.json")
        sys.exit(0)
    else:
        print("无效选择，退出")
        sys.exit(1)


if __name__ == '__main__':
    main()
