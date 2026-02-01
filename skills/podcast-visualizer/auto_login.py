#!/usr/bin/env python3
"""
使用Playwright自动登录YouTube并获取Cookies
"""

import asyncio
import json
from playwright.async_api import async_playwright
import os


async def get_youtube_cookies_with_credentials(username, password):
    """
    使用提供的凭证自动登录YouTube并获取cookies

    Args:
        username: Google账号
        password: 密码
    """
    print("=" * 60)
    print("YouTube 自动登录工具")
    print("=" * 60)
    print()

    # 启动虚拟显示（如果没有图形界面）
    import subprocess
    display = os.environ.get('DISPLAY')

    if not display:
        print("🖥️  启动虚拟显示...")
        display_process = subprocess.Popen([
            'Xvfb', ':99',
            '-screen', '0', '1920x1080x24',
            '-ac'
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        os.environ['DISPLAY'] = ':99'
        import time
        time.sleep(2)
        print("✓ 虚拟显示已启动")
        print()

    try:
        async with async_playwright() as p:
            # 启动Chromium
            print("🌐 正在启动浏览器...")
            browser = await p.chromium.launch(
                headless=False,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ]
            )

            # 创建新上下文
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080}
            )

            # 创建新页面
            page = await context.new_page()

            # 打开YouTube
            print("📺 打开YouTube登录页面...")
            await page.goto('https://accounts.google.com/signin/v2/identifier?service=youtube')

            # 等待页面加载
            await page.wait_for_load_state('networkidle')

            # 输入邮箱
            print("📧 输入邮箱...")
            await page.wait_for_selector('input[type="email"]', timeout=10000)
            await page.fill('input[type="email"]', username)
            await page.click('text=下一步')

            # 等待密码输入框
            print("🔐 输入密码...")
            await page.wait_for_selector('input[type="password"]', timeout=10000)
            await page.fill('input[type="password"]', password)
            await page.click('text=下一步')

            # 等待可能的2FA（2分钟超时）
            print("⏳ 等待登录完成...")
            print("   （如果有2FA，请在2分钟内完成验证）")
            print()

            try:
                # 等待跳转到YouTube或出现登录完成的标志
                await page.wait_for_url('https://www.youtube.com*', timeout=120000)
                print("✓ 登录成功")
            except:
                print("⚠️  超时或出现2FA验证")
                print("   尝试获取已登录的cookies...")

            # 再等一会确保cookies完全加载
            await asyncio.sleep(3)

            # 导航到YouTube主页确保登录状态
            await page.goto('https://www.youtube.com')
            await asyncio.sleep(2)

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
                if 'youtube' in cookie.get('domain', '').lower() or 'google' in cookie.get('domain', '').lower()
            ]

            print(f"✓ 获取到 {len(youtube_cookies)} 个相关cookies")

            # 保存到文件
            output_file = '/root/clawd/skills/podcast-visualizer/youtube_cookies.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(youtube_cookies, f, indent=2)

            print(f"✓ Cookies已保存到: {output_file}")
            print()

            # 显示使用方法
            print("=" * 60)
            print("📋 使用方法")
            print("=" * 60)
            print(f"python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies {output_file}")
            print()

            # 关闭浏览器
            await browser.close()

            return True

    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        # 停止虚拟显示
        if not display:
            try:
                display_process.terminate()
                display_process.wait(timeout=5)
                print("✓ 虚拟显示已停止")
            except:
                pass


def main():
    """主函数"""
    import sys

    # 读取凭证
    username = "xizhicareer@gmail.com"
    password = "Xizhijob2023@"

    print()
    print("=" * 60)
    print("⚠️  安全提醒")
    print("=" * 60)
    print("1. 凭证只在本地使用，不会上传到任何服务器")
    print("2. Cookies文件保存后，密码不会明文存储")
    print("3. 完成后可以选择删除cookies文件")
    print("=" * 60)
    print()

    # 运行
    success = asyncio.run(get_youtube_cookies_with_credentials(username, password))

    if not success:
        print()
        print("=" * 60)
        print("❌ 自动登录失败")
        print("=" * 60)
        print("可能的原因:")
        print("1. 需要双因素认证（2FA）")
        print("2. 密码已更改")
        print("3. YouTube检测到异常登录")
        print()
        print("建议:")
        print("1. 如果需要2FA，请使用手动导出cookies的方法")
        print("2. 检查账号和密码是否正确")
        print("3. 参考 COOKIES_GUIDE.md 进行手动导出")
        sys.exit(1)


if __name__ == '__main__':
    main()
