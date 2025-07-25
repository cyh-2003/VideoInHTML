import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

app.get('/video', (req, res) => {
    res.type('video/mp4')
    const videoStream = fs.createReadStream('./ad.mp4')
    videoStream.pipe(res)
})

app.listen(3000, () => {
    console.log('服务器启动')
})
