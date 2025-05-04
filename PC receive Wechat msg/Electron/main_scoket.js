const { app, BrowserWindow, Notification, Menu, Tray } = require('electron')
const path = require('path')
const net = require('net')

let tray = null

const client = new net.Socket()
// 创建 TCP 客户端
client.connect(80, '127.0.0.1', () => {
    client.write('lbwnb') // 发送数据
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

client.on('error', (err) => {
    if (app.isReady()) createWindow('连接失败', err.code)
})

app.on('ready', () => {
    createWindow('启动')
})

client.on('close', () => {
    setTimeout(() => client.connect(80, '127.0.0.1', () => {
        client.write('lbwnb')
    }), 3000)
})

var temp = null

client.on('data', (data) => {
    if (temp != data.toString()) {
        temp = data.toString()
        let result = JSON.parse(data)
        let lines = result.msg.split('\n')
        if (app.isReady()) createWindow(lines[2], lines[1])
        new Notification({
            title: '微信新消息', body: `
            ${lines[2]}
        ${lines[1]}`
        }).show()
    }
})