# 特性
- 单页应用网站前端架构
- spa, ssr, webpack4.x, vue2.x

# 运行
```bash
# 安装依赖
npm i
# 开发，服务启动后，访问localhost:9998
npm run dev
# 构建
npm run build
```

# 部署
使用pm2在服务器上部署, 启动命令```npm run start```
pm2指南文档：https://pm2.keymetrics.io/


# 问题记录
- 使用style-loader报错： [Vue warn]: Error in beforeCreate hook: "ReferenceError: document is not def
查询资料：https://stackoverflow.com/questions/64766001/vue-server-side-rendering-error-in-beforecreate-hook-referenceerror-document