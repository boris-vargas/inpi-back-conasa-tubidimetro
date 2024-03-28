//======================================================
//Informações sobre a conexão com a internet
//======================================================
//const publicIp = require('public-ip')
const mysql = require('../../config/database')
const remote = require('../network/updateIp')
var internetAvailable = require("internet-available");
var fs = require('fs');
var serial_number = ''
var software = ''
var firmware = ''
var infosnet = {}
var remoteInfosEquipament = {}
var basicsInfos = {}



var remoteInfos ={
	internet:{
		ipv4: '',
		ipv6: '',
		cidade:'',
		estado:'',
		pais:'',
		cep:'',
		lat:'',
		lon:'',
		timezone:'',
		utc_offset:'',
		provedor:''
	},
	controlador:{
		sistema:'',

	} 

}
//============================================================================================
//Get ipv4 publico
//============================================================================================
function updateInternetIp(){
	fs.readFile('/home/pi/serialnumber.js', 'utf8', function (err,data) {
		if (err) {
			console.log('erro leitura no arquivo(0) serialnumber.js -  remote.js')
		}else{
			serial_number = JSON.parse(data).serial_number
			software = JSON.parse(data).software
			firmware = JSON.parse(data).firmware
			mysql.query(`SELECT * FROM config_sistema`, function (err, result){
				if(err) {
					console.log(err)
				}else {
					//console.log(result)
					remoteInfosEquipament = {
						serial_number: serial_number, 
						id_sistema: result[0].id , 
						nome: result[0].nome , 
						objeto: remoteInfos.internet,
						software: software,
						firmware: firmware,
						infosnet: remote.getNetworkInfos()
					}			
				}
			})
			/*Verifica internet antes de verificar IP externo*/
			internetAvailable({
			      timeout: 3000, 
			      retries: 5,
			      host: '8.8.8.8'
			    }).then(() => {
				// publicIp.v4().then(function(ip){
				// 	remoteInfos.internet.ipv4  = ip
				// }).catch(function(err){
				// 	console.log('Erro-> Nao foi possivel verificar o IP externo...certifique-se de que a CPU esta conectada a internet')
				// })
		    }).catch(() => {
			        //console.log("No internet");
			    });  
		}
	})

}
//============================================================================================
//atualiza IP publico na inicialização depois de 60 segundos
//============================================================================================
setTimeout(function(){
	updateInternetIp()
},60000)
//============================================================================================
//atualiza IP publico na inicialização depois de 120 segundos
//============================================================================================
setTimeout(function(){
	updateInternetIp()
},120000)
//============================================================================================
//atualiza IP publico a cada 1 hora
//============================================================================================
setInterval(function(){
	updateInternetIp()
},3600000)

//======================================================
//midware para informações remotas
//======================================================
function remoteInfosReq(req,res,next){

	if (req.method=='POST'){
		res.send(remoteInfos)

	}else {
		return res.status(200).send({valid: 'ok'})
	}
}
//======================================================
//midware para informações dos equipamentos
//======================================================
function deviceInfosReq(req,res,next){

	if (req.method=='POST'){
		res.send(remoteInfosEquipament)

	}else {
		return res.status(200).send({valid: 'ok'})
	}
}
//======================================================
//midware para informações de internet
//======================================================
function updateInternetIpStart(req,res,next){

	if (req.method=='POST'){
		updateInternetIp()
		res.send({status: 'internet atualizada'})

	}else {
		return res.status(200).send({status: 'ok'})
	}
}
//======================================================
//midware para setar numero de serie
//======================================================
function deviceSetSerialNumber(req,res,next){
	var serialnumber = req.body.serialnumber
	var firmware = req.body.firmware
	var software = req.body.software
	if (req.method=='POST'){

		fs.readFile('/home/pi/serialnumber.js', 'utf8', function (err,data) {
			if (err) {
				console.log('erro leitura no arquivo(1) -  remote.js')
			}else{
					//console.log('arquivo read to write->',data)
					basicsInfos = JSON.parse(data)
					basicsInfos.serial_number = serialnumber
					basicsInfos.firmware = firmware
					basicsInfos.software = software

					fs.writeFile('/home/pi/serialnumber.js', JSON.stringify(basicsInfos), 'utf8', function (err) {
						if (err) return console.log('erro na escrita do arquivo')

							updateInternetIp()
						res.send({status:'escrita ok'})
					});
				}
			})

	}else {
		return res.status(200).send({valid: 'ok'})
	}
}
//======================================================
//midware para verificar internet
//======================================================
function deviceInternetConnection(req,res,next){
	if (req.method=='POST'){
		internetAvailable({timeout: 3000,retries: 5,host: '8.8.8.8'}).then(function(response){
			res.status(201).send({valid: 'ok', status:'internet ok'})
		}).catch(function(err){
			res.status(201).send({valid: 'err', status:'internet nok'})
		})
	}else {
		return res.status(200).send({status: 'ok'})
	}
}
//======================================================
//Verifica informações de internet controlador
//======================================================
	setInterval(function(){
		fs.readFile('/home/pi/serialnumber.js', 'utf8', function (err,data) {
			if (err) {
				console.log('erro leitura no arquivo(2) -  remote.js')
			}else{
					//console.log('arquivo update->',data)
					serial_number = JSON.parse(data).serial_number
					software = JSON.parse(data).software
					firmware = JSON.parse(data).firmware
					mysql.query(`SELECT * FROM config_sistema`, function (err, result){
						if(err) {
							console.log(err)
						}else {
		
						}		
					})
				}
		})	
	},120000)
//======================================================
//disponibiliza informações de internet
//======================================================
function remoteInfosEquipamentRead(){
	return remoteInfosEquipament
}


module.exports = {remoteInfos, remoteInfosReq, deviceInfosReq, deviceSetSerialNumber, updateInternetIpStart, remoteInfosEquipamentRead, deviceInternetConnection}

