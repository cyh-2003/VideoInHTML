import express from "express"
import fs from "node:fs"
import multer from "multer"
import cors from "cors"
import cookieParser from "cookie-parser"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import path from "node:path"
import jwt from "jsonwebtoken"

const secret = "shubaobao"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (!fs.existsSync('/uploads')) fs.mkdirSync('/uploads')

//login使用变量
let user = {}

const admin = JSON.parse(fs.readFileSync("./admin.json", "utf-8"))
const app = express()
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.mimetype.startsWith('image/')) {
                cb(null, 'public/images/album/')
            } else if (file.mimetype.startsWith('audio/')) {
                cb(null, 'public/music/')
            } else if (file.mimetype.includes('octet-stream')) {
                cb(null, 'uploads/')
            }
        },
        filename: function (req, file, cb) {
            if (file.mimetype.includes('octet-stream')) {
                cb(null, req.body.index + '-' + req.body.fileName)
            } else {
                cb(null, file.originalname)
            }
        },
    })
})

//阻止直接访问.html文件
app.use((req, res, next) => {
    if (/\.html$/i.test(req.url)) {
        res.redirect("/")
    }
    next()
})

let data = JSON.parse(fs.readFileSync("./data.json", "utf-8"))
app.use(cors())
app.use(express.static(path.resolve(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

/**
 * 返回一个信息json
 * @param {number} code
 * @param {string} message
 * @param {string} dataMsg
 * @param redirect url
 * @param token jwt
 * @returns {JSON}
 */
function createResponse(code, message, dataMsg, redirect, token) {
    return {
        code,
        message,
        data: {
            msg: dataMsg,
            redirect,
            token
        }
    }
}

// 文件上传jwt验证
const check_jwt = (req, res, next) => {
    jwt.verify(req.cookies.token, secret, (err, decoded) => {
        if (err) {
            res.json(createResponse(-1, "error", "验证失败"))
        } else {
            next()
        }
    })
}

//管理路由
app.get("/admin",(req, res) => {
    jwt.verify(req.cookies.token, secret, (err, decoded) => {
        if (err) {
            res.redirect("/login")
        } else {
            res.sendFile(__dirname + "/public/admin.html")
        }
    })
})

//登录路由
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html")
})

//登录
app.post("/login", upload.none(), (req, res) => {
    if (!user[req.ip]) {
        user = { ...user, [req.ip]: {time:0,bool:true}}
    }
    if (user[req.ip].time >= 5) {
        res.json(createResponse(-1, "login_fail", "失败次数过多"))
        if (user[req.ip].bool) {
            user[req.ip].bool = false
            setTimeout(() => {
                user[req.ip].time = 0
            }, 600000)
        }
        return
    }
    try {
    const { username, password } = req.body
        if (username === admin.username && password === admin.password) {
        const token = jwt.sign({ username: username }, secret, { algorithm: "HS256", expiresIn: "30d" })
        res.cookie("token", token, {
            maxAge: 2592000000, // 一个月
            httpOnly: true,              // 禁止 JS 访问（防 XSS）
            secure: false,                // 仅 HTTPS 传输
            sameSite: "strict",          // 防 CSRF
            path: "/",                   // Cookie 生效路径
        })
        res.json(createResponse(0, "success", "登录成功", "/admin"))
    } else if (req.body.username !== username && password !== admin.password) {
        res.json(createResponse(-1, "error", "用户名和密码错误"))
        user[req.ip].time++
    } else if (username !== admin.username) {
        res.json(createResponse(-1, "error", "用户名错误"))
        user[req.ip].time++
    } else {
        res.json(createResponse(-1, "error", "密码错误"))
        user[req.ip].time++
    }
    } catch (error) {
        res.json(createResponse(-1, error.toString(), "参数错误"))
        user[req.ip].time++
    }}
)

//登录前自动验证
app.post("/login_verify", check_jwt,(req, res) => {
    res.json(createResponse(0, "success", "登录成功", "/admin"))
})

//退出登录
app.get("/login_out", (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict", path: "/", })
    res.json(createResponse(0, "success", "退出成功"))
})

//获取歌曲列表
app.get("/get_songs", (req, res) => {
    res.json(data)
})

//添加新歌
app.post("/add_song",check_jwt, upload.fields([
    { name: 'image', maxCount: 1 },  // 专辑封面（单文件）
    { name: 'music', maxCount: 1 }   // 歌曲（单文件）
]), (req, res) => {
    let new_id = Object.keys(data).filter(key => !isNaN(key)).length + 1
    let new_data = {
        [new_id]: {
            name: req.body.name,
            time: req.body.time,
            path: req.body.musicname,
            album: req.files['image'][0].originalname,
            singer: req.body.singer,
            lrc: req.body.lrc,
        }
    }
    data = { ...data, ...new_data }
    fs.writeFileSync("./data.json", JSON.stringify(data))
    res.json(createResponse(0, "success", "上传成功"))
})

//更新
app.post("/update_song_info", check_jwt,upload.fields([
    { name: 'image', maxCount: 1 },  // 专辑封面（单文件）
    { name: 'music', maxCount: 1 }   // 歌曲（单文件）
]), (req, res) => {
    res.json(createResponse(0, "success", "更新文件成功"))
})

//更新json信息
app.post("/update_song", express.json(), (req, res) => {
    jwt.verify(req.cookies.token, secret, (err, decoded) => {
        if (err) {
            res.json(createResponse(-1, "error", "验证失败"))
        } else {
            data = req.body
            fs.writeFileSync("./data.json", JSON.stringify(req.body))
            res.json(createResponse(0, "success", "更新成功"))
        }
    })
})

//大文件上传接口(不分片)
app.post('/upload_large_single_file',check_jwt, upload.single('music'), (req, res) => {
    res.json(createResponse(0, "success", "上传成功"))
})

//大文件上传接口(分片)
app.post('/upload_large_file',check_jwt,upload.single('music'), (req, res) => {
    res.json(createResponse(0, "success", "上传成功"))
})

//合并分片接口
app.post('/merge_large_file', (req, res) => {
    jwt.verify(req.cookies.token, secret, (err, decoded) => {
        if (err) {
            res.json(createResponse(-1, "error", "验证失败"))
        } else {
            const uploadPath = './uploads'
            let files = fs.readdirSync(path.join(process.cwd(), uploadPath))
            files = files.sort((a, b) => a.split('-')[0] - b.split('-')[0])
            const writePath = path.join(process.cwd(), `public/music`, req.body.fileName)
            files.forEach(item => {
                fs.appendFileSync(writePath, fs.readFileSync(path.join(process.cwd(), uploadPath, item)))
                fs.unlinkSync(path.join(process.cwd(), uploadPath, item))
            })
            res.json(createResponse(0, "success", "合并成功"))
        }
    })
})

//未找到资源返回404
app.use((req, res) => {
    res.status(404).send("<h1>404访问错误</h1>")
})

app.listen(3000, () => {
    console.log("服务器启动")
})