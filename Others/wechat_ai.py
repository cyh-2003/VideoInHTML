#https://github.com/cluic/wxauto
import time
from wxauto import WeChat
from openai import OpenAI
wx = WeChat()
#实例化openai
client = OpenAI(
    base_url="",
    api_key=""
)
#要监听的人
listen_list = [
    ''
]

for i in listen_list:
    wx.AddListenChat(who=i, savepic=False)  # 添加监听对象并且自动保存新消息图片

def ai():
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": 对方消息},
        ]
    )
    assistant_reply = completion.choices[0].message.content
    return assistant_reply

# 持续监听消息，并且收到消息后回复“收到”
while True:
    msgs = wx.GetListenMessage()
    for chat in msgs:
        msg = msgs.get(chat)  # 获取消息内容
        print(msg)
        print(msg[0][0])
        print(msg[0][1])
        print('------------')
        if msg[0][0] == '':#填入监听的对象
            对方消息 = str(msg[0][1])
            print(对方消息)
            ai()
            回复 = ai()
            chat.SendMsg(回复)  # 回复收到
            continue
        elif msg[0][0] == 'SYS':
            对方消息 = str(msg[1][1])
            print(对方消息)
            回复 = ai()
            chat.SendMsg(回复)  # 回复收到
            continue
    time.sleep(2)