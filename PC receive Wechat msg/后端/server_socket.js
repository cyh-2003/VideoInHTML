import net from 'net'

globalThis.user = null
globalThis.msg = null
globalThis.old_msg = null
globalThis.bool = false

const server = net.createServer((socket) => {
    console.log('客户端已连接:', socket.remoteAddress, socket.remotePort)

    // 监听客户端发送的数据
    socket.on('data', (data) => {
        const text = data.toString()
        if (text.includes('tencent')) {
            // 如果是 tencent 格式的数据，解析并提取 user 和 msg
            try {
                const json = JSON.parse(text)
                const lines = json.msg.split('\n')
                msg = lines[1].match(/:(.*)/)[1].trim()
                user = lines[2]
            } catch (error) {
                console.log('解析错误:', error)
                user = '未知错误'
                msg = text
            }
            socket.write('resive')
            socket.end()
        } else {
            bool = true
        }
    })

    setTimeout(() => {
        if (bool) {
            setInterval(() => {
                if (old_msg !== msg) {
                    old_msg = msg // 更新 old_msg
                    socket.write(JSON.stringify({ user, msg }))
                }
            }, 1000)
        } else {
            socket.write('404')
            socket.end()
        }
    }, 1000)

    // 监听客户端断开连接
    socket.on('end', () => {
        console.log('客户端已断开连接:', socket.remoteAddress, socket.remotePort)
    })

    // 监听连接关闭
    socket.on('close', () => {
        console.log('连接已关闭:', socket.remoteAddress, socket.remotePort)
    })
})

// 启动服务器，监听端口
server.listen(80, () => {
    console.log('服务器已启动，监听端口 80')
})
