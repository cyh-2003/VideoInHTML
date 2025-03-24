import socket
import json
import threading
import re

user = ""
msg = ""
old_msg = ""


def handle_client(c, addr):
    global old_msg
    global user
    global msg

    print(addr, "连接")

    try:
        while True:
            # 接收数据
            req = c.recv(2048)
            if not req:  # 客户端关闭连接
                print(addr, "断开连接")
                break

            request = req.decode("utf-8")
            print("收到请求:", request)

            # 处理 tencent 格式的消息
            if "tencent" in request:
                try:
                    json_data = json.loads(request)
                    lines = json_data["msg"].split("\n")
                    msg_match = re.search(r":(.*)", lines[1])
                    msg = msg_match.group(1).strip()
                    user = lines[2]
                    print(f"收到消息: 用户={user}, 消息={msg}")
                    c.sendall(b"resive")
                    c.close()
                    break
                except (json.JSONDecodeError, IndexError, AttributeError) as e:
                    print("解析消息失败:", e)
                    c.sendall(bytes("无效的消息格式", encoding="utf-8"))
                    break

            # 处理 lbwnb 格式的消息
            elif "lbwnb" in request:
                while True:
                    if old_msg != msg:
                        old_msg = msg
                        req_data = {"user": user, "msg": msg}
                        c.sendall(bytes(json.dumps(req_data), encoding="utf-8"))

            # 其他情况
            else:
                c.sendall(b"404")
                c.close()
                break

    except ConnectionResetError:
        print(addr, "连接被重置")
    except Exception as e:
        print(addr, "发生错误:", e)


if __name__ == "__main__":
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
        server.bind(("0.0.0.0", 80))
        server.listen()
        print("服务器已启动，等待连接...")
        while True:
            # 接受客户端连接
            c, addr = server.accept()
            print(f"新连接: {addr}")

            # 为每个客户端创建一个新线程
            t = threading.Thread(target=handle_client, args=(c, addr))
            t.start()
