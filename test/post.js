const request = require('../index');
const expect = require('chai').expect;
const common = require('./common');
const fs = require('fs');

describe('POST', function(){
  it('发送POST请求，获取txt数据', function(done){
    request({
      url: common.base_url + '/post/txt',
      method: 'POST',
      body: {
        a: 1,
        b: 2
      }
    }, function(err, res, body){
      expect(body).to.be.a('string');
      done();
    });
  });
  it('发送POST请求，上传图片', function(done){
    request({
      url: common.base_url + '/post/upload',
      method: 'POST',
      stream: { avatar: fs.createReadStream(__filename) }
    }, function(err, res, body){
      expect(body).to.be.an('object');
      expect(body.success).to.be.ok;
      done();
    });
  });
});