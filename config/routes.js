const express = require('express')
const mysqlQuery = require('../api/mysql/mysqlHTTP')
const mysqlBackApp = require('../api/mysql/mysqlBackApp')
const modbusSerialFC3 = require('../api/modbus/modbusSerialFC3')
const modbusSerialFC16 = require('../api/modbus/modbusSerialFC16')
const modbusTCPServer = require('../api/modbus/modbusLocal')
const modbusScanNodes = require('../api/modbus/searchNodes')
const auth = require('./auth')
const AuthService = require('../api/user/authservice')
const piController = require('../api/picontroller/exec')
const filesServer = require('../api/files/uploadfiles')
const wifimanager = require('../api/network/wifimanager')
const updateIp = require('../api/network/updateIp')
const remote = require('../api/remote/remote')
const hashgenerator = require('../api/user/newhashgenerator')
const email = require('../api/tasks/email')
const configModbusPort = require('../api/modbus/modbusSetPortTimeout')
//const telegram = require("../api/telegram/index")

module.exports = function (server){

	/*
	* Rotas abertas
	*/
		const openApi = express.Router()
		server.use('/oapi', openApi)

		openApi.post('/login', AuthService.login)
		openApi.post('/signup', AuthService.signup)
		openApi.post('/validateToken', AuthService.validateToken)

		/*
		* Rotas protegidas por Token JWT
		*/
		// const protectedApi = express.Router()
		// server.use('/api', protectedApi)

		// protectedApi.use(auth)


	server.use('/api/queryMysql/:queryMysql',mysqlQuery.queryMysql)
	server.use('/api/queryMysqlInsertPost',mysqlQuery.queryMysqlInsertPost)
	server.use('/api/queryMysqlGetPost',mysqlQuery.queryMysqlGetPost)
	server.use('/api/queryMysqlUpdatePostHash',mysqlQuery.queryMysqlUpdatePostHash)
	server.use('/api/queryMysqlNewUserHash',mysqlQuery.queryMysqlNewUserHash)
	server.use('/api/queryMysqlLog',mysqlQuery.queryMysqlLog)
	
	server.use('/api/backupAppMySql',mysqlBackApp.backupAppMySql)
	server.use('/api/backupAppMySqlDownload',mysqlBackApp.backupAppMySqlDownload)
	server.use('/api/backupAppNodeRedDownload',mysqlBackApp.backupAppNodeRedDownload)


	server.use('/api/modbusread/:id/:inicio/:quant/:search',modbusSerialFC3.queryModbus)
	server.use('/api/modbusread',modbusSerialFC3.readModbusPost)

	server.use('/api/modbuswrite/:id/:registro/:valor/:search',modbusSerialFC16.writeModbus)
	server.use('/api/modbuswritepost',modbusSerialFC16.writeModbusPost)
	server.use('/api/modbuswritemultiplespost',modbusSerialFC16.writeModbusMultiplesPost)

	server.post('/api/modbusscan',modbusScanNodes.modbusStartScanSearch)
	server.use('/api/modbusgetsearch',modbusScanNodes.modbusGetSearch)
	server.use('/api/cancelscannetwork',modbusScanNodes.modbusCancelSearch)




	server.use('/api/picontroller/sudo/:cmd',piController.execFunc)
	server.use('/api/picontroller/cpudata',piController.execFuncCpuData)
	server.use('/api/picontrollerPost',piController.picontrollerPost)

	server.use('/api/getImageList',filesServer.getImageList)
	server.use('/api/uploadImageGeneral',filesServer.uploadImageGeneral)
	server.use('/api/uploadImageObject',filesServer.uploadImageObject)
	server.use('/api/deleteFileGeral',filesServer.deleteFileGeral)
	server.use('/api/deleteFileObjetos',filesServer.deleteFileObjetos)
	server.use('/api/uploadArquivoImportMysql',filesServer.uploadArquivoImportMysql)
	server.use('/api/uploadArquivoImportNodeRed',filesServer.uploadArquivoImportNodeRed)
	
	

	server.use('/api/scannetworkwifi',wifimanager.scanNetwork)
	server.use('/api/statusnetworkwifi',wifimanager.statusNetwork)
	server.use('/api/setnetworkwifi',wifimanager.setNetwork)
	server.use('/api/updateip',updateIp.setNetworkIp)
	server.use('/api/getnetworkip',updateIp.getNetworkIp)

	

	server.use('/api/remoteinfos',remote.remoteInfosReq)
	server.use('/api/devicesetserialnumber',remote.deviceSetSerialNumber)
	server.use('/api/deviceinfosreq',remote.deviceInfosReq)
	server.use('/api/updateinternetipstart',remote.updateInternetIpStart)
	server.use('/api/deviceInternetConnection',remote.deviceInternetConnection)


	server.use('/api/createnewhashnodered',hashgenerator.createNewHashNodeRed)
	server.use('/api/sendEmailSenha',email.sendEmailSenha)
	
	server.use('/api/setConfigModbusPort',configModbusPort.setConfigModbusPort)
	server.use('/api/setConfigEmail',email.setConfigEmail)
	server.use('/api/getConfigEmail',email.getConfigEmail)
	server.use('/api/testeConfigEmail',email.testeConfigEmail)


	// server.use('/api/verifcarTokenBot', telegram.botToken)
	// server.use('/api/testeAlarme', telegram.alertTeste)
	// server.use('/api/stopBot', telegram.stopBot)


}
