#!/usr/bin/env python3
"""
使用Playwright自动化获取YouTube Cookies
"""

import asyncio
import json
from playwright.async_api import async_playwright
import os


async def get_youtube_cookies():
    """
    启动浏览器，打开YouTube，等待用户登录，然后获取cookies
    """
    print("=" * 60)
    print("YouTube Cookies 获取工具 (Playwright)")
    print("=" * 60)
    print()

    async with async_playwright() as p:
        # 启动Chromium浏览器（非headless模式）
        print("🌐 正在启动浏览器...")
        browser = await p.chromium.launch(
            headless=False,  # 显示浏览器窗口
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ]
        )

        # 创建新上下文
        context = await browser.new_context()

        # 创建新页面
        page = await context.new_page()

        # 打开YouTube
        print("📺 打开YouTube...")
        await page.goto('https://www.youtube.com')

        print()
        print("=" * 60)
        print("请在浏览器中登录你的YouTube账号")
        print("=" * 60)
        print("1. 点击右上角的登录按钮")
        print("2. 输入你的Google账号和密码")
        print("3. 登录完成后，按 Enter 键继续...")
        print()

        # 等待用户确认
        input("按 Enter 键继续（确保已经登录YouTube）...")

        # 获取cookies
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


if __name__ == '__main__':
    # 检查是否在支持图形界面的环境中运行
    display = os.environ.get('DISPLAY')
    if not display:
        print("❌ 错误: 需要图形界面环境")
        print("当前环境没有DISPLAY环境变量")
        print()
        print("如果你在远程服务器上，可以:")
        print("1. 使用SSH X11转发: ssh -X user@server")
        print("2. 或者在本地机器上运行此脚本")
        print("3. 或者使用VNC等远程桌面工具")
        print()
        print("如果你无法使用图形界面，请使用以下替代方案:")
        print("1. 在本地浏览器中登录YouTube")
        print("2. 使用浏览器扩展导出cookies")
        print("3. 将cookies文件上传到服务器")
        print()
        print("详细步骤请参考: COOKIES_GUIDE.md")
        exit(1)

    # 运行cookie获取
    asyncio.run(get_youtube_cookies())
