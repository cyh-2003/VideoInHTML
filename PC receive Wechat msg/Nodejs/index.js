const express = require("express")

const app = express()

app.get('/wechat', (req, res) => {
    let text = decodeURI(req._parsedUrl.href)

    try {
        msg = text.match(/\+([^+\s]+)/g)[0].replace('+', '')
        user = text.match(/](.*?)%/)[1]
    } catch (error) {
        user = '无法解析'
        msg = text
    }
    res.send('成功')
})

app.post('/wechat', (req, res) => {
    try {
        if (user && msg) {
            res.send(JSON.stringify({ user: user, msg: msg }))
        } else {
            res.send(JSON.stringify({ "error": "还没有消息" }))
        }
    } catch (error) {
        res.send(JSON.stringify({ "error": error }))
    }
})

app.listen(80, () => {
    console.log("服务器启动")
})