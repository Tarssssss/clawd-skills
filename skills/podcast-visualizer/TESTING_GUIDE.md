## ⚠️ YouTube下载问题说明

### 问题
你提供的视频 `https://www.youtube.com/watch?v=HiyzzcuaAac` 需要登录验证。

YouTube有时会对自动化访问进行限制，要求：
1. 使用cookies（从浏览器导出）
2. 或者换一个不需要登录的视频

### 解决方案

#### 方案1: 使用Cookies（推荐用于该视频）

**步骤:**

1. **安装浏览器导出工具**
```bash
pip install browser-cookie3
```

2. **导出Chrome cookies**
```bash
# 在浏览器中登录YouTube后运行
python3 -c "
from browser_cookie3 import chrome
import json

cookies = []
for cookie in chrome(domain_name='youtube.com'):
    cookies.append({
        'name': cookie.name,
        'value': cookie.value,
        'domain': cookie.domain,
    })

with open('youtube_cookies.json', 'w') as f:
    json.dump(cookies, f)
print('Cookies已导出到 youtube_cookies.json')
"
```

3. **使用cookies下载**
```bash
python3 -m src.cli https://www.youtube.com/watch?v=HiyzzcuaAac --cookies youtube_cookies.json
```

#### 方案2: 换个视频测试（更简单）

以下是一些可以尝试的公开播客视频：

- **TED Talks**: https://www.youtube.com/watch?v=aN6VACVO_2I
- **Huberman Lab**: https://www.youtube.com/watch?v=D4jE3w6kH4w
- **Joe Rogan**: https://www.youtube.com/watch?v=sYQh1L-5rN0

你可以：
1. 选择任何一个视频进行测试
2. 或者提供你自己的YouTube账号cookies

### 建议测试流程

为了快速验证功能，建议：

1. **先用方案2测试** - 换个不需要登录的视频
2. **验证完整流程** - 下载 → 识别 → 分块 → 可视化
3. **再处理目标视频** - 使用cookies处理原视频

你想选哪个方案？
