//-------------------------
//Constantes
//-------------------------
//const port = 5001
//-------------------------
//Dependencias
//-------------------------
const bodyParser = require('body-parser')
const express = require('express')
const server  = express();
const allowCors = require('../config/cors')
const consts = require('../config/consts')
const queryparser = require('express-query-int')
const moment = require('moment')
const master = require('../api/modbus/modbusSerialConfig')
const modbusSearch = require('../api/modbus/searchNodes')
const alarmes = require('../api/tasks/alarmes')
const files = require('../api/files/uploadfiles')
const remote = require('../api/remote/remote')
const backUpApp = require('../api/mysql/mysqlBackApp')

const iocpu = require('../api/picontroller/readiocpu')

var picontroller =  require('../api/network/updateIp')

// const tunneling = require('../api/remote/tunneling')
// tunneling.tunneling()



//-------------------------
//Middleware parser
//-------------------------
server.use(bodyParser.urlencoded({ extended: true }))
//server.use(bodyParser.json())
server.use(bodyParser.json({limit: '32mb'}))
server.use(allowCors)
server.use(queryparser())

//-------------------------
//Midleware
//-------------------------
server.use(function (req,res, next) {
	next()
})
//-------------------------
//unhandledRejection não tratadas
//-------------------------
// process.on("unhandledRejection", function(promise, reason){
//     //console.log(reason)
//  });
//-------------------------
//Incia servidor
//-------------------------
server.listen(consts.sysInformation.serverPort,function(){
	console.log(`Driver modbus (API) rodando na porta: ${consts.sysInformation.serverPort}`)
})

module.exports = server
