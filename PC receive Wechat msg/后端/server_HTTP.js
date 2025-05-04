import express from 'express'

const app = express()

globalThis.user = null
globalThis.msg = null

app.get('/:id', (req, res) => {
    console.log(req.url)
    if (req.url.includes('tencent')) {
        if (req.headers['shubaobao'] && req.headers['shubaobao'] === 'lbwnb') {
            let text = decodeURIComponent(req.url)
            const lines = text.split('\n')
            msg = lines[1]
            user = lines[2]
            console.log(msg)
            console.log(user)
            res.send('成功')
        } else {
            res.redirect('http://www.shubaobaomumen.com/')
        }
    } else { res.redirect('http://www.shubaobaomumen.com/') }
})

app.post('/wechat', (req, res) => {
    if (req.headers['user'] && req.headers['user'] === "lbwnb") {
        try {
            if (user && msg) {
                res.status(200).send(JSON.stringify({ user, msg }))
            } else {
                res.status(400).send(JSON.stringify({ "error": "还没有消息" }))
            }
        } catch (error) {
            res.send(JSON.stringify({ "error": error }))
        }
    } else {
        res.redirect('http://www.shubaobaomumen.com/')
    }
})

app.listen(80, () => {
    console.log("服务器启动")
})
