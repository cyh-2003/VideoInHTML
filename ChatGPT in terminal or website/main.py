# #coding=utf-8
import json
from langchain.chains import ConversationChain
from langchain_community.chat_models import ChatTongyi
from langchain.memory import ConversationBufferMemory

# 打开JSON文件
with open('api.json', 'r') as file:
    json_data = file.read()

state = False
data = json.loads(json_data)
key = data['key']
modelName = data['model']

memory = ConversationBufferMemory(return_messages=True)

def ai():
    print('\033[32m'+'''
   ____   _               _      ____   ____    _____ 
  / ___| | |__     __ _  | |_   / ___| |  _ \  |_   _|
 | |     |  _ \   / _  | | __| | |  _  | |_) |   | |  
 | |___  | | | | | (_| | | |_  | |_| | |  __/    | |  
  \____| |_| |_|  \____|  \__|  \____| |_|       |_|                                                  
''' + '\033[0m')
    while True:
        ask = input("请输入内容,按q退出")
        if ask == "q" or ask == "Q":
            break
        else:
            print(get_chat_response(ask, memory,key,modelName))

def get_chat_response(text, memory,api,model):
    model = ChatTongyi(model=model,api_key=api)
    chain = ConversationChain(llm=model, memory=memory)
    response = chain.invoke({"input": text})
    return response["response"]

if __name__ == "__main__":
    ai()