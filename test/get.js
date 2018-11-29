const request = require('../index');
const expect = require('chai').expect;
const common = require('./common');
const fs = require('fs');

describe('GET', function(){
  it('发送GET请求，获取txt数据', function(done){
    request({ url: common.base_url + '/get/txt' }, function(err, res, body){
      expect(body).to.be.a('string');
      done();
    });
  });
  it('发送GET请求，获取json数据', function(done){
    request({ url: common.base_url + '/get/json' }, function(err, res, body){
      expect(body).to.be.an('object');
      done();
    });
  });
  it('发送GET请求，使用query请求', function(done){
    request({ url: common.base_url + '/get/json?a=1', query: { b: 2 } }, function(err, res, body){
      expect(body).to.be.an('object');
      expect(body.a === '1').to.be.ok;
      expect(body.b === '2').to.be.ok;
      done();
    });
  });
  it('发送GET请求，获取图片数据，使用pipe', function(done){
    let writeStream = fs.createWriteStream(__dirname + '/file_test/get_file.png');
    request({ url: 'https://qiniu.staticfile.org/static/images/qiniu_logo.5249e634.png', pipe: writeStream }, function(err, res, body){
      let isExists = fs.existsSync(__dirname + '/file_test/get_file.png');
      expect(isExists).to.be.ok;
      done();
    });
  });
  it('发送GET请求，获取文件数据，使用pipe', function(done){
    let writeStream = fs.createWriteStream(__dirname + '/file_test/get_file.js');
    request({ url: common.base_url + '/get/file', pipe: writeStream }, function(err, res, body){
      let isExists = fs.existsSync(__dirname + '/file_test/get_file.js');
      expect(isExists).to.be.ok;
      done();
    });
  });
  it('发送GET请求，获取文件数据，不使用pipe', function(done){
    request({ url: common.base_url + '/get/file'}, function(err, res, body){
      expect(body).to.be.a('string');
      done();
    });
  });
});