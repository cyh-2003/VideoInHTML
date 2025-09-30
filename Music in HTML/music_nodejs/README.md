只是加了后端管理音乐

token设置中只用http,secure为false<br>https,secure为true更安全

登录信息在 admin.json 里,数据在 data.json,后端运行只读取一次，以后只写入不读取

部署服务器记得改端口

未完成
1. ~~文件上传进度~~
2. ~~相似度算法~~
3. ~~web component/template(写好了才发现有这个好东西,未使用)~~

# 关于reactive.js
还要操控dom才能使用,如何精确的思路如下<br>

模板写ref函数 -> 预编译为render函数 -> render函数生成虚拟节点 -> diff算法 -> 挂载或更新 -> 渲染器 -> 生成标签 -> 赋值

# 关于文件名随机
以随机生成字符串为准

如果在浏览器的安全上下文中可使用 [Web Crypto API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Crypto_API)的SHA-256进行随机字符串

将 `random_string()` 替换 await SHA256() 参数传入为文件对象
# 根据开源协议署名
- MIT [express](https://github.com/expressjs/express)
- MIT [multer](https://github.com/expressjs/multer)
- MIT [cookie-parser](https://github.com/expressjs/cookie-parser)
- MIT [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- MIT [Uivers](https://uiverse.io/)