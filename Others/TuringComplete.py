# 用于图灵完备的二进制速算
import pyautogui
import sys
import time


def decompose_number(n):
    numbers = [128, 64, 32, 16, 8, 4, 2, 1]
    result = []

    # 遍历每个数字
    for num in numbers:
        if n >= num:
            result.append(num)
            n -= num
    return result


def mouse(x):
    pyautogui.moveTo(x, 963, duration=0.1)
    pyautogui.dragTo(x, 963, button="left")
    time.sleep(0.5)
    # pyautogui.dragTo(539, 1022, button="left")
    # pyautogui.press('space')


while True:
    text = input("请输入一个数字: ")
    if text.isdigit():
        number = int(text)
    else:
        sys.exit()

    # 分解数字
    decomposition = decompose_number(number)

    for num in decomposition:
        if num == 128:
            mouse(43)
        elif num == 64:
            mouse(163)
        elif num == 32:
            mouse(281)
        elif num == 16:
            mouse(391)
        elif num == 8:
            mouse(524)
        elif num == 4:
            mouse(646)
        elif num == 2:
            mouse(759)
        elif num == 1:
            mouse(881)
        else:
            print("错误")
