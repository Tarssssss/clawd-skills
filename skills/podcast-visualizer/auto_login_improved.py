#!/usr/bin/env python3
"""
改进的YouTube自动登录脚本 - 更灵活的选择器
"""

import asyncio
import json
import os
import sys
import subprocess
from playwright.async_api import async_playwright


async def get_youtube_cookies_improved(username, password):
    """改进的自动登录脚本"""

    print("=" * 60)
    print("YouTube 自动登录工具 (改进版)")
    print("=" * 60)
    print()

    # 启动虚拟显示
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
            print("🌐 正在启动浏览器...")
            browser = await p.chromium.launch(
                headless=False,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ]
            )

            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                locale='zh-CN',  # 设置为中文
            )

            page = await context.new_page()

            print("📺 打开Google登录...")
            # 打开登录页面
            await page.goto('https://accounts.google.com/signin/v2/identifier?service=youtube', timeout=60000)
            await page.wait_for_load_state('networkidle')

            # 截图保存（用于调试）
            await page.screenshot(path='login_step1.png')
            print("✓ 截图已保存到 login_step1.png")

            # 尝试多种选择器输入邮箱
            email_selectors = [
                'input[type="email"]',
                'input[name="identifier"]',
                'input[name="Email"]',
                '#identifierId',
            ]

            print("📧 输入邮箱...")
            for selector in email_selectors:
                try:
                    await page.wait_for_selector(selector, timeout=5000)
                    await page.fill(selector, username)
                    print(f"✓ 使用选择器: {selector}")
                    break
                except:
                    continue
            else:
                print("❌ 无法找到邮箱输入框")
                return False

            # 点击下一步
            next_button_selectors = [
                'button:has-text("下一步")',
                'button:has-text("Next")',
                '#identifierNext',
                'button[type="submit"]',
            ]

            print("点击下一步...")
            for selector in next_button_selectors:
                try:
                    await page.wait_for_selector(selector, timeout=5000)
                    await page.click(selector)
                    print(f"✓ 使用选择器: {selector}")
                    break
                except:
                    continue
            else:
                print("❌ 无法找到下一步按钮")
                return False

            await asyncio.sleep(2)

            # 截图
            await page.screenshot(path='login_step2.png')
            print("✓ 截图已保存到 login_step2.png")

            # 输入密码
            print("🔐 输入密码...")
            password_selectors = [
                'input[type="password"]',
                'input[name="password"]',
                'input[name="Passwd"]',
                '#password',
            ]

            for selector in password_selectors:
                try:
                    await page.wait_for_selector(selector, timeout=5000)
                    await page.fill(selector, password)
                    print(f"✓ 使用选择器: {selector}")
                    break
                except:
                    continue
            else:
                print("❌ 无法找到密码输入框")
                return False

            # 点击下一步
            print("点击下一步...")
            for selector in next_button_selectors:
                try:
                    await page.wait_for_selector(selector, timeout=5000)
                    await page.click(selector)
                    print(f"✓ 使用选择器: {selector}")
                    break
                except:
                    continue

            # 等待登录完成（可能需要2FA）
            print()
            print("⏳ 等待登录完成...")
            print("   （如果需要2FA，请在2分钟内完成）")
            print()

            try:
                # 等待跳转到YouTube或出现2FA页面
                await page.wait_for_url('**/youtube.com**', timeout=120000)
                print("✓ 登录成功")
            except:
                print("⚠️  超时，可能需要2FA验证")
                print("   尝试获取已加载的cookies...")

            await asyncio.sleep(3)

            # 截图
            await page.screenshot(path='login_step3.png')
            print("✓ 截图已保存到 login_step3.png")

            # 导航到YouTube
            await page.goto('https://www.youtube.com')
            await asyncio.sleep(2)

            # 获取cookies
            print()
            print("🍪 正在获取cookies...")
            cookies = await context.cookies()

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

            print(f"✓ 获取到 {len(youtube_cookies)} 个cookies")

            # 保存
            output_file = '/root/clawd/skills/podcast-visualizer/youtube_cookies.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(youtube_cookies, f, indent=2)

            print(f"✓ Cookies已保存到: {output_file}")
            print()
            print("使用方法:")
            print(f"  python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies {output_file}")

            await browser.close()
            return True

    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        if not display:
            try:
                display_process.terminate()
                display_process.wait(timeout=5)
                print("✓ 虚拟显示已停止")
            except:
                pass


if __name__ == '__main__':
    username = "xizhicareer@gmail.com"
    password = "Xizhijob2023@"

    success = asyncio.run(get_youtube_cookies_improved(username, password))

    if not success:
        print()
        print("=" * 60)
        print("❌ 自动登录失败")
        print("=" * 60)
        print()
        print("建议:")
        print("1. 查看截图文件 (login_step*.png) 了解问题")
        print("2. 如果需要2FA，使用手动导出cookies的方法")
        print("3. 参考 COOKIES_GUIDE.md 进行手动导出")
        sys.exit(1)
