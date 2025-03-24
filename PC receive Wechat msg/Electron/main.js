const { app, BrowserWindow, Notification, Menu, Tray } = require('electron')
const path = require('path')

let old_text = ''//随便一个字符串
var timer = 60000
let tray = null

app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true
})

function createWindow(user, msg) {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        icon: path.join(__dirname, './wechat.png'),
        webPreferences: {
            preload: path.resolve(__dirname, './preload.js')
        }
    })
    win.webContents.send('api', { user, msg })//主进程向渲染进程发生消息
    win.loadFile('./src/index.html')
    win.setAlwaysOnTop(true)//窗口顶置
    //win.openDevTools()//打开浏览器控制台
    win.on("close", (event) => {
        event.preventDefault() //阻止退出程序
        //win.setSkipTaskbar(true) //取消任务栏显示
        win.hide() //隐藏主程序窗口
    })
    if (tray) tray.destroy()//删除上一个托盘
    tray = new Tray(path.join(__dirname, './src/pubilc/wechat.png'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '退出', click: () => {
                win.destroy()
                app.exit()
            }
        },
    ])
    tray.setToolTip('自动获取消息')
    tray.setContextMenu(contextMenu)
}
//异步:用于获取新消息
async function new_text() {
    let response = await fetch('', {//自己补充api接口
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    return await response.json()
}
//查看有没有新消息逻辑
async function check_new_text() {
    const result = await new_text()
    if (result.msg !== old_text) {
        old_text = result.msg
        new Notification({
            title: '微信新消息', body: `
        ${result.user}
${result.msg}`
        }).show()
        createWindow(result.user, result.msg)
        timer = 2500
    } else {
        timer = 60000
    }
    setTimeout(check_new_text, timer)
}

check_new_text()

/*
const { app, BrowserWindow, Notification, Menu, Tray } = require('electron')
const path = require('path')
const net = require('net')

let tray = null

// 创建 TCP 客户端
const client = net.createConnection({
    host: '127.0.0.1', // 服务器地址
    port: 80 // 服务器端口
})

// if (app.isPackaged) {
//     app.setLoginItemSettings({
//         openAtLogin: true,
//         openAsHidden: true,
//     })
// }

function createWindow(user, msg = '') {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        icon: path.join(__dirname, './src/public/wechat.png'),
        webPreferences: {
            preload: path.resolve(__dirname, './preload.js')
        }
    })
    win.webContents.send('api', { user, msg })//主进程向渲染进程发生消息
    win.loadFile('./src/index.html')
    win.setAlwaysOnTop(true)//窗口顶置
    //win.openDevTools()//打开浏览器控制台
    win.on("close", (event) => {
        event.preventDefault() //阻止退出程序
        //win.setSkipTaskbar(true) //取消任务栏显示
        win.hide() //隐藏主程序窗口
    })
    if (tray) tray.destroy()//删除上一个托盘
    tray = new Tray(path.join(__dirname, './src/public/wechat.png'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '退出', click: () => {
                client.end()
                if (win) win.destroy()
                app.exit()
            }
        },
    ])
    tray.setToolTip('自动获取消息')
    tray.setContextMenu(contextMenu)
}

client.on('connect', () => {
    if (app.isReady()) createWindow('连接到服务器')
})

client.on('error', (err) => {
    if (app.isReady()) createWindow('连接失败', err.code)
})

app.on('ready', () => {
    createWindow('启动')
})

client.on('data', (data) => {
    let result = JSON.parse(data)
    if (app.isReady()) createWindow(result.user, result.msg)
    //     new Notification({
    //         title: '微信新消息', body: `
    //     ${result.user}
    // ${result.msg}`
    //     }).show()
})
*/