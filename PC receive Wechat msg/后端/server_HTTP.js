import express from 'express'

const app = express()

globalThis.user = null
globalThis.msg = null

app.get('/wechat', (req, res) => {
    let text = decodeURIComponent(req.url)
    const lines = text.split('\n')
    msg = lines[1].match(/:(.*)/)[1].trim().slice(1)
    user = lines[2]
    res.send('成功')

})

app.post('/wechat', (req, res) => {
    if (user && msg) {
        res.send(JSON.stringify({ user: user, msg: msg }))
    } else {
        res.send(JSON.stringify({ "error": "还没有消息" }))
    }
})

app.listen(80, () => {
    console.log("服务器启动")
})