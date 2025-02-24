import os
import msvcrt
import ctypes
import sys
import time

print("本脚本用于禁用搜索框的建议功能(屏蔽Windows搜索自带的广告),需要以管理员权限运行")
print("按任意键继续")
msvcrt.getch()

if ctypes.windll.shell32.IsUserAnAdmin() == 1:
    pass
else:
    print("没有管理员权限,请以管理员权限运行")
    time.sleep(1.5)
    sys.exit()

result = os.system('reg add "HKEY_CURRENT_USER\\SOFTWARE\\Policies\\Microsoft\\Windows\\explorer" /v DisableSearchBoxSuggestions /t reg_dword /d 1 /f')

if result == 0:
    print("Windows搜索广告屏蔽成功")
    print("你想要重启以完成设置吗?(y确认,其他任意键退出)")
    if msvcrt.getch().decode() == 'y':
        os.system('shutdown /r /t 3')
    else:
        sys.exit()
else:
    print("Windows广告屏蔽失败")
    time.sleep(1.5)
    sys.exit()