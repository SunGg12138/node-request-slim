# 简单的nodejs请求模块

## 安装

```bash
$ npm install node-request-slim
```

## 测试

```bash
# 启动测试服务器
$ node test/server/app.js
# 测试
$ mocha
```

## 参数

```javascript
/**
 * @param {String || Object} options 必选，如果是string类型就认为是url
 * @param {String} options.url 必选，请求的url，包括protocol、host、path、port
 * @param {String} options.method 可选，请求的类型，默认为GET
 * @param {Object} options.query 可选，查询信息
 * @param {Object} options.form 可选，发送application/x-www-form-urlencoded信息
 * @param {Object} options.body 可选，发送application/json信息
 * @param {Object} options.formData 可选，发送文件
 * @param {Stream} options.stream 可选，发送文件流
 * @param {Object} options.headers 可选，设置请求头信息，如果指定content-type，就不会被修改
 * @param {Stream} options.pipe 可选，如果指定pipe会直接把响应信息pipe到指定流里面
 * @param {Boolean} options.outputBuffer 可选，是否输出buffer数据
 * @param {Agent} options.agent 可选，配置请求的代理参数，agent和agentOptions优先agent
 * @param {Object} options.agentOptions 可选，配置请求的代理配置参数，agent和agentOptions优先agent
 * @param {Number} timeout 可选，设置超时时间，默认超时时间60秒
*/
```