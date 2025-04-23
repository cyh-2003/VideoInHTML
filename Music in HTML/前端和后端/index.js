import express from "express"
import fs from "node:fs"
import multer from "multer"
import cors from "cors"
import cookieParser from "cookie-parser"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import path from "node:path"
import jwt from "jsonwebtoken"

const sercret = "shubaobao"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const admin = JSON.parse(fs.readFileSync("./admin.json", "utf-8"))
const app = express()
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.mimetype.startsWith('image/')) {
                cb(null, 'public/images/album/')
            } else if (file.mimetype.startsWith('audio/')) {
                cb(null, 'public/music/')
            }
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
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
//管理路由
app.get("/admin", (req, res) => {
    jwt.verify(req.cookies.token, sercret, (err, decoded) => {
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
    if (req.body.username == 1 && req.body.password == admin.password) {
        const token = jwt.sign({ username: req.body.username }, sercret, { algorithm: "HS256", expiresIn: "1d" })
        res.cookie("token", token, {
            maxAge: 24 * 60 * 60 * 1000, // 1 天（毫秒）
            httpOnly: true,              // 禁止 JS 访问（防 XSS）
            secure: true,                // 仅 HTTPS 传输
            sameSite: "strict",          // 防 CSRF
            path: "/",                   // Cookie 生效路径
        });
        res.json(createResponse(0, "success", "登录成功", "/admin"))
    } else if (req.body.username !== admin.username && req.body.password !== admin.password) {
        res.json(createResponse(-1, "error", "用户名和密码错误"))
    } else if (req.body.username !== admin.username) {
        res.json(createResponse(-1, "error", "用户名错误"))
    } else {
        res.json(createResponse(-1, "error", "密码错误"))
    }
})
//登录前自动验证
app.post("/login_verify", (req, res) => {
    jwt.verify(req.cookies.token, sercret, (err, decoded) => {
        if (decoded) {
            res.json(createResponse(0, "success", "登录成功", "/admin"))
        }
    })
})
//退出登录
app.get("/login_out", (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "strict", path: "/", })
    res.json(createResponse(0, "success", "退出成功"))
})
//获取歌曲列表
app.get("/get_songs", (req, res) => {
    res.json(data)
})
//添加新歌
app.post("/add_song", upload.fields([
    { name: 'image', maxCount: 1 },  // 专辑封面（单文件）
    { name: 'music', maxCount: 1 }   // 歌曲（单文件）
]), (req, res) => {
    let new_id = Object.keys(data).filter(key => !isNaN(key)).length + 1
    let new_data = {
        [new_id]: {
            name: req.body.name,
            time: req.body.time,
            path: req.files['music'][0].originalname,
            album: req.files['image'][0].originalname,
            songer: req.body.songer,
            lrc: req.body.lrc,
        }
    }
    data = { ...data, ...new_data }
    fs.writeFileSync("./data.json", JSON.stringify(data))
    res.json(createResponse(0, "success", "上传成功"))
})
//更新
app.post("/update_song_info", upload.fields([
    { name: 'image', maxCount: 1 },  // 专辑封面（单文件）
    { name: 'music', maxCount: 1 }   // 歌曲（单文件）
]), (req, res) => {
    res.json(createResponse(0, "success", "更新文件成功"))
})
//更新json信息
app.post("/update_song", express.json(), (req, res) => {
    data = req.body
    fs.writeFileSync("./data.json", JSON.stringify(req.body))
    res.json(createResponse(0, "success", "更新成功"))
})
//未找到资源返回404
app.use((req, res) => {
    res.status(404).send("<h1>访问错误</h1>")
})

app.listen(3000, () => {
    console.log("服务器启动")
})