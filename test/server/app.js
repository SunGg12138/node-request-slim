const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const common = require('../common');
const multer = require('koa-multer');

app.use(bodyParser());

// get 请求返回的数据
router.get('/get/txt', async function(ctx){
  ctx.body = 'success';
});
router.get('/get/json', async function(ctx){
  ctx.body = ctx.request.query;
});
router.get('/get/file', async function(ctx){
  ctx.body = require('fs').createReadStream(__filename);
});
// post 请求返回的数据
router.post('/post/txt', async function(ctx){
  ctx.body = JSON.stringify(ctx.request.body);
});
router.post('/post/json', async function(ctx){
  ctx.body = ctx.request.body;
});
router.post('/post/file', async function(ctx){
  ctx.body = require('fs').createReadStream(__filename);
});

// 上传文件
const upload = multer({ dest: __dirname + '/uploads/' });
router.post('/post/upload', upload.single('avatar'), async ctx => {
  if (ctx.req.file){
      ctx.body = { success: true };
  } else {
      ctx.body = { success: false };
  }
});
router.post('/post/formData', upload.single('avatar'), async ctx => {
  if (ctx.req.file && ctx.req.body){
      ctx.body = { success: true, data: ctx.req.body };
  } else {
      ctx.body = { success: false };
  }
});
router.get('/headers', async function(ctx){
  ctx.body = ctx.headers;
});

app.use(router.routes());

app.listen(common.port, function(){
  console.log('Server success run at ' + common.port);
});