const { contextBridge, ipcRenderer } = require('electron')

ipcRenderer.on('api', (event, data) => {
    // 在此处处理从主进程接收的数据
    contextBridge.exposeInMainWorld('data', data)
})