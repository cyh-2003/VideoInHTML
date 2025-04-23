import requests
from bs4 import BeautifulSoup
import time
import msvcrt
import os

Phone = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/131.0.0.0"
PC = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0"
爬过的 = []
num = 1


def main(url: str, UserAgent: str = PC):
    """
    参数:\n
    url (str): 要处理的URL地址\n
    UserAgent(str):用户代理
    \n可选PC/Phone 默认PC
    """
    try:
        request = requests.get(url, headers={"user-agent": UserAgent})
    except requests.exceptions.SSLError:
        request = requests.get(url, headers={"user-agent": UserAgent}, verify=False)
    soup = BeautifulSoup(request.text, "html.parser")
    a = soup.find_all("a")
    for i in a:
        text = i.string
        href = i.get("href")
        keywordOne = [
            "贴纸",
            "徽章",
            "结束",
            "主题",
            "推荐",
            "推出",
            "体验版",
            "+1",
            "免费游玩",
            "非 Steam",
            "gleam.io",
            "预告",
            "預告",
            "转为免费",
            "更新",
            "PS5",
            "Roblox",
            "giveaway.su",
            "点数商店",
            "freeanywhere",
            "下次",
            "下星期",
        ]  # 用于排除的
        keywordTwo = [
            "免费",
            "领取",
            "骨折",
            "限时",
            "新史低",
            "好价",
            "限免",
            "入库",
            "临时工",
            "FOD",
            "免費",
            "收回",
            "手慢無",
        ]  # 用于白嫖的
        try:
            if any(keyword in text for keyword in keywordOne) or len(text) <= 10:
                pass
            elif any(keyword in text for keyword in keywordTwo) and text not in 爬过的:
                爬过的.append(text)
                print(text)
                print(f"https://keylol.com/{href}", "\n")
        except TypeError:
            pass


def 爬虫():
    global num
    print(f"\033[1;31;42m第{num}次爬\033[0m")
    num = num + 1
    main("https://keylol.com/t572814-1-1")
    main("https://keylol.com/f319-1")
    main("https://keylol.com/forum.php?m=index&mobile=yes", Phone)
    main("https://keylol.com/f328-1")


def 停止():
    if msvcrt.kbhit():
        if msvcrt.getch().decode("utf-8").lower() == "p":
            print("停止爬虫")
            exit()


def 退出():
    os.system("taskkill /f /im python.exe")


爬虫()
time.sleep(20)
"""
choose = input("开始爬虫,1一直循环,2单次爬取,3多次爬取:")
if choose == "1":
    while True:
        爬虫()
        time.sleep(10)
        停止()
elif choose == "2":
    爬虫()
elif choose == "3":
    a = input("请输入要爬取的循环的次数")
    for i in range(1,int(a)+1):
        爬虫()
        time.sleep(10)
        停止()
else:
    print("输入错误")
"""
