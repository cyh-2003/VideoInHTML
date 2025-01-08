import streamlit as st
from langchain.memory import ConversationBufferMemory
from main import get_chat_response

st.title("ChatGPT in website")

with st.sidebar:
    api_key = st.text_input("请输入通义 API Key:", type="password")
    st.markdown("[获取通义 API key](https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key)")
    st.divider()
    api_model = st.text_input("请选择模型", value="qwen-turbo")
    st.markdown("[模型列表](https://help.aliyun.com/zh/model-studio/getting-started/models)")

if "memory" not in st.session_state:
    st.session_state["memory"] = ConversationBufferMemory(return_messages=True)
    st.session_state["messages"] = [{"role": "ai",
                                     "content": "你好,我是你的AI助手,有什么可以帮你的吗？"}]

for message in st.session_state["messages"]:
    st.chat_message(message["role"]).write(message["content"])

prompt = st.chat_input("想交流点什么")
if prompt:
    if not api_key:
        st.info("请输入你的通义 API Key")
        st.stop()
    elif not api_model:
        st.info("请选择你的通义模型")
        st.stop()
    st.session_state["messages"].append({"role": "human", "content": prompt})
    st.chat_message("human").write(prompt)

    with st.spinner("AI正在思考中,请稍等..."):
        response = get_chat_response(prompt, st.session_state["memory"],
                                     api_key,api_model)
    msg = {"role": "ai", "content": response}
    st.session_state["messages"].append(msg)
    st.chat_message("ai").write(response)