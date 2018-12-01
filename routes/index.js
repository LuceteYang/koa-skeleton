const Router = require('koa-router');

const api = new Router();
const commonCtrl = require('./common.controller');

api.get('/', commonCtrl.templateRender);
api.get('/string', commonCtrl.stringRender);
api.get('/json', commonCtrl.jsonRender);


module.exports = api;