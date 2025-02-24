import pychrome
import keyboard
import json
import re

# 打开并读取 JSON 文件
with open("data.json", "r", encoding="gbk") as f:
    data = json.load(f)

    for key, value in data.items():
        match = re.match(r"(.*?)(BV[a-zA-Z0-9]{10})", value)
        if match.group(1):
            title = match.group(1)  # 提取标题
            print(f"{key}: {title}")
        else:
            print(f"{key}:未找到标题")

url = input("请输入视频链接或者序号或BV号:")
if url.isdigit():
    url = "https://www.bilibili.com/" + re.match(
        r"(.*?)(BV[a-zA-Z0-9]{10})", data[f"{url}"]
    ).group(2)
elif "BV" in url and "www" not in url:
    url = "https://www.bilibili.com/" + url
elif "www" in url and "http" not in url:
    url = "http://" + url

# 创建一个 Chrome 浏览器实例
try:
    browser = pychrome.Browser(url="http://127.0.0.1:9222")
    tab = browser.new_tab()
except Exception:
    print("请先打开浏览器")
    exit()
tab.start()
# 打开 Bilibili 视频页面
tab.Page.navigate(url=url)
tab.wait(5)
tab.Runtime.evaluate(expression="var video = document.querySelector('video')")


def on_key_event(event):
    if event.name == "left":
        tab.Runtime.evaluate(expression="video.currentTime -= 3")
    elif event.name == "right":
        tab.Runtime.evaluate(expression="video.currentTime += 3")
    elif event.name == "r":
        tab.Runtime.evaluate(
            expression="video.paused === true ? video.play() : video.pause()"
        )


# 监听键盘事件
keyboard.on_press(on_key_event)

# 保持程序运行
keyboard.wait("`")  # 按下 ` 键退出程序
