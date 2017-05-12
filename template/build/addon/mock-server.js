/**
 * Created by Webstorm.
 * @author taoqili
 * @date 2017/4/24
 */
var path = require('path')
var express = require('express')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var config = require('../../config').mock
var loadModule = require('./load-module')

module.exports = function () {
  var router = express.Router()
  var app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: false}))
  app.use(cookieParser())

  router.all('*', function (req, res, next) {
    var urlInfo = req._parsedUrl
    var pathName = urlInfo.pathname
    var lastIndex = pathName.lastIndexOf('/') + 1
    var dirPath = pathName.substring(0, lastIndex).replace('/api', '')
    var moduleName = pathName.substring(lastIndex).replace('&', '')
    var modules = loadModule(path.join(__dirname, '../../src/api-mock' + dirPath))
    var module = modules[moduleName]
    res.header("Content-Type", "application/json; charset=utf-8");
    res.cookie('test', 1, {maxAge: 30 * 60 * 1000})
    if (module && typeof module === 'function') {
      res.end(JSON.stringify(module(req, res, next)))
    } else {
      res.end('{"ret":"error","code":"-1","msg":"模块' + moduleName + '不存在！","data":""}')
    }
  })
  app.use('/', router)
  app.listen(config.port, function () {
    console.log('Mock服务器已启动...')
  })
}