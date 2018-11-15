const request = require('../index');
const expect = require('chai').expect;
const common = require('./common');

describe('Headers', function(){
  it('设置headers', function(done){
    request({
      url: common.base_url + '/headers?a=1#12',
      headers: {
        'content-type': 'application/json'
      }
    }, function(err, res, body){
      expect(body).to.be.an('object');
      expect(body['content-type']).to.be.a('string');
      done();
    });
  });
});