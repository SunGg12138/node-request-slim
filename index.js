const http = require('http');
const https = require('https');
const debug = require('debug')('node-request-slim');
const req_protocols = { 'http:': http, 'https:': https };
const { URL } = require('url');
const mime = require('mime-types');
const querystring = require('querystring');
const FormData = require('form-data');

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
 * @param {Number} timeout 可选，设置超时时间
*/
function request(options, callback) {

  // 如果options是字符串就认为是url
  if (typeof options === 'string') options = { url: options };
  
  // url参数是必要的参数
  if (!options.url) return callback('options.url is required');

  // 解析参数
  let { url, method, query, form, body, formData, stream, headers, pipe, timeout } = options;

  // 设定默认值
  method = method || 'GET';
  headers = headers || {};

  // 设置writeData会执行req.write
  // 设置pipeData会执行res.pipe
  let writeData, pipeData;

  // 优先级 form > body > stream > formData
  switch (true) {
    case !!form:
        // 用户自己设置了content-type，这里不做修改
        if (!headers['content-type'] && !headers['Content-Type']) {
          headers['content-type'] = 'application/x-www-form-urlencoded';
        }
        // application/x-www-form-urlencoded提交
        if (typeof form === 'object') form = querystring.stringify(form);
        // 设置writeData
        writeData = form;
      break;
    case !!body:
      // 用户自己设置了content-type，这里不做修改
      if (!headers['content-type'] && !headers['Content-Type']) {
        headers['content-type'] = 'application/json';
      }
      // application/json提交
      if (typeof body === 'object') body = JSON.stringify(body);
      // 设置writeData
      writeData = body;
      break;
    case !!stream:
    case !!formData:
      let obj = stream || formData;
      // 提交multipart/form-data数据流
      let _form = new FormData();
      for (let key in obj) {
        _form.append(key, obj[key]);
      }
      // 用户自己设置了content-type，这里不做修改
      if (!headers['content-type'] && !headers['Content-Type']) {
        headers = Object.assign(headers, _form.getHeaders());
      }
      pipeData = _form;
      break;
  }

  // 设置查询字符串
  if (query) {
    query = querystring.stringify(query);
    if (url.indexOf('?') > -1) url += '&' + query;
    else url += '?' + query;
  }

  // 构建请求参数
  let request_URL = new URL(url);
  let request_options = {
    protocol: request_URL.protocol,
    hostname: request_URL.hostname,
    path: request_URL.pathname + request_URL.search + request_URL.hash,
    port: request_URL.port,

    method: method,
    headers: headers,
    timeout: timeout || null
  };

  debug('请求参数：S%', request_options);

  // 获取请求协议类型
  let req_protocol = req_protocols[request_URL.protocol];

  // 发送请求
  let req = req_protocol.request(request_options, function (res) {
    // 获取响应头的content-type信息
    let contentType = mime.extension(res.headers['content-type']);

    debug('响应content-type：S%', contentType);

    let data;

    if (pipe) {
      // 设置pipe会直接把响应信息pipe到指定流里面
      res.pipe(pipe);
    } else {
      data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
    }

    // 监听响应结束事件
    res.on('end', () => {
      // 响应的JSON数据会执行JSON.parse
      if (data && contentType === 'json') {
        try {
          data = JSON.parse(data);
        } catch (error) {}
      }
      // 回调函数
      callback && callback(null, res, data);
    });
  });

  // 监听错误事件
  req.on('error', (err) => {
    callback && callback(err);
  });

  // pipe文件
  if (pipeData) {
    pipeData.pipe(req);
    pipeData.on('end', function(){
      req.end();
    });
    pipeData.on('error', function(err){
      callback && callback(err);
    });
    return;
  }

  // 提交数据
  if (writeData) {
    req.write(writeData);
  }

  req.end();
};

// 支持promise
request.promise = function(options){
  return new Promise((resolve, reject) => {
    request(options, function(err, res, body){
      if (err) reject(err);
      else resolve(body);
    });
  });
};

module.exports = request;