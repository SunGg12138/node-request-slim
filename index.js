const http = require('http');
const { URL } = require('url');
const mime = require('mime-types');
const querystring = require('querystring');
const FormData = require('form-data');

/**
 * url 请求的url，可以指定port，protocol
 * form 发送'application/x-www-form-urlencoded'信息
 * body 发送'application/json'信息
 * stream 发送文件
 * method 指定请求方法
 * headers 设置请求头信息
 * timeout 设置超时时间
 * pipe 设置响应文件的pipe
*/
function request(options, callback) {
  let { url, form, body, stream, formData, method, headers, timeout, pipe } = options;

  method = method || 'GET';
  headers = headers || {};

  let writeData, pipeData;

  if (form) {
    // 用户自己设置了content-type，这里不做修改
    if (!headers['content-type'] && !headers['Content-Type']) {
      headers['content-type'] = 'application/x-www-form-urlencoded';
    }
    // application/x-www-form-urlencoded提交
    if (typeof form === 'object') {
      form = querystring.stringify(form);
    }
    writeData = form;
  } else if (body) {
    // 用户自己设置了content-type，这里不做修改
    if (!headers['content-type'] && !headers['Content-Type']) {
      headers['content-type'] = 'application/json';
    }
    // application/json提交
    if (typeof body === 'object') {
      body = JSON.stringify(body);
    }
    writeData = body;
  } else if (stream || formData) {
    let obj = stream || formData;
    // 提交multipart/form-data数据流
    let form = new FormData();
    for (let key in obj) {
      form.append(key, obj[key]);
    }
    // 用户自己设置了content-type，这里不做修改
    if (!headers['content-type'] && !headers['Content-Type']) {
      headers = Object.assign(headers, form.getHeaders());
    }
    pipeData = form;
  }

  // 没有url直接报错
  if (!url) {
    callback && callback(new Error('url param is required'));
    return;
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
  // 发送请求
  let req = http.request(request_options, function (res) {
    let data = '';

    res.setEncoding('utf8');
    
    // 获取响应头的content-type信息
    let contentType = mime.extension(res.headers['content-type']);
    if (contentType === 'bin' && pipe) {
      res.pipe(pipe);
    } else {
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
    }
    // 响应结束事件
    res.on('end', () => {
      switch (contentType) {
        // 如果响应头的contentType是json尽量转化成json
        case 'json':
          try {
            data = JSON.parse(data);
          } catch (error) { }
          break;
        // 如果是数据流并且在上面已经pipe了，这里就直接执行回调就可以了
        case 'bin':
          if (pipe) {
            callback && callback(null, res);
            return;
          }
      }
      callback && callback(null, res, data);
    });
  });

  req.on('error', (err) => {
    callback && callback(err);
  });

  // pipe上传文件
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

  // 发送信息
  if (writeData) {
    req.write(writeData);
  }

  req.end();
};

request.promise = function(options){
  return new Promise((resolve, reject) => {
    request(options, function(err, res, body){
      if (err) reject(err);
      else resolve(body);
    });
  });
};

module.exports = request;