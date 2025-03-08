const express = require("express")
const { exec } = require('child_process')
const iconv = require('iconv-lite')
const escape = require('escape-html')

const app = express()

//运行net session可查看是否有管理员权限
app.all('/*', (req, res) => {
    const dynamicValue = req.params['0'] // 获取动态参数的值
    if (dynamicValue) {
        // 运行 CMD 命令
        exec(dynamicValue, { encoding: 'buffer' }, (error, stdout, stderr) => {
            const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="data:,">
    <title>${escape(dynamicValue)}</title>
</head>
<style>
</style>
<body>
    <div>${error ? '命令执行失败' : '--> 执行命令'}: ${escape(dynamicValue)}</div>
    ${error ? `<div>错误信息:</div>` : `<div><-- 返回结果:</div>`}
    <pre>${escape(iconv.decode(error ? stderr : stdout, 'gbk'))}</pre>
</body>
</html>
    `
            res.status(error ? 500 : 200).send(html)
        })
    } else {
        res.status(500).send(`
<link rel="shortcut icon" href="data:,">
<title>无法执行</title>
<h1 style='color:red;'>命令不能为空</h1>`)
    }
})

app.listen(3000, () => {
    console.log("服务器启动")
})