只是加了后端管理音乐

token设置中只用http,secure为false<br>https,secure为true更安全

登录信息在 admin.json 里,数据在 data.json,后端运行只读取一次，以后只写入不读取

部署服务器记得改端口,根目录新建uploads文件夹

未完成
1. ~~文件上传进度~~
2. ~~相似度算法~~
3. ~~web component/template(写好了才发现有这个好东西,未使用)~~

# 关于reactive.js
还要操控dom才能使用,如何精确操控未知

# 根据开源协议署名
- MIT [express](https://github.com/expressjs/express)
- MIT [multer](https://github.com/expressjs/multer)
- MIT [cookie-parser](https://github.com/expressjs/cookie-parser)
- MIT [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- MIT [Uivers](https://uiverse.io/)