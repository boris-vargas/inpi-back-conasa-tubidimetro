process.env.NTBA_FIX_319 = 1;
const telegram = require("node-telegram-bot-api")
const mysqlComp = require('../../config/database')
const modbusSerialFC3 = require('../../api/modbus/modbusSerialFC3')
const master = require('../../api/modbus/modbusSerialConfig')
const moment = require("moment")
const fs = require("fs")
const cron = require("node-cron")

var objGlobal = {}
var sql

function listarAlarmes(){
	sql = (`SELECT descricao, device_modbus_read_id, device_modbus_read_reg, bke_alarmes_telegram FROM config_compontes`)
	mysqlComp.query(sql, function(err, result) {
		if (err) {
			console.log(`Erro banco: `, err)
		}else{
			objGlobal.alarme = result
			for (var i = 0; i < result.length; i++) {
				if (result[i].bke_alarmes_telegram) {
					var dado = result[i]
		    		dado.bke_alarmes_telegram = JSON.parse(dado.bke_alarmes_telegram)
		    		delete(dado.bke_alarmes_telegram.emails)
		    		delete(dado.bke_alarmes_telegram.sms)
		    		//console.log('qui...')
		    		verificarObj(dado, i)
				}
	    	}
		}
    })
}

objGlobal.val = []
objGlobal.confirmacao = []
objGlobal.resp = []
var bot, idchat, avisarDepois

function botToken(req, res, next) {
    if (req.method == "POST") {
    	// console.log(req.body)
		bot = new telegram(req.body.tokenBot, {polling: true})

		bot.on('message', function(msg) {

	    	const chatId = msg.chat.id;

        	const text = msg.text.toLowerCase()

        	if (text == "/idchat") {
				bot.sendMessage(chatId, `O id do seu chat é ${chatId}`)
	  		}
	  	}); 

		res.status(200).send({status: "ok!"}) 
	}else{
		res.status(200).send({status: "ok!"})
	}
}

function alertTeste(req, res, next) {

    if (req.method == "POST") {

		bot.sendMessage(req.body.idchat, "Configurações concluidas")

		bot.stopPolling().then(function(resp) {
			bot = null
		})

		res.status(200).send({status: "ok!"})

    }else{
		res.status(200).send({status: "ok!"})
    }

}

function stopBot(req, res, next) {

	if (req.method == "POST") {
		
		if (bot) {
			if (bot.isPolling()) {
				bot.stopPolling().then(function(resp) {
					bot = null
				})
				res.status(200).send({status: "ok!"})
			}
		}

    }else{
		res.status(200).send({status: "ok!"})
    }

}

function avisarNovamente(msg, chat, index) {
	avisarDepois = setTimeout(function() {
		objGlobal.confirmacao[index] = Math.random() * 1000
		console.log('avisar novamente')
		teste(objGlobal.confirmacao[index], index, idchat)
		bot.sendMessage(chat,`Passando para avisar novamente\n\n${msg}`)
	},1000*600)
}

function limparAviso() {
	clearTimeout(avisarDepois)
}

function verificarObj(dado, index) {
    if (!!!bot) {
    	if(dado.bke_alarmes_telegram.habilita == 1){
			var token = dado.bke_alarmes_telegram.bot.token

			bot = new telegram(token, {polling: true})

			
			bot.on("message", function(msg) {
		    	const chatId = msg.chat.id;

		    	const text = msg.text.toLowerCase()

		    	if (text == "/idchat") {
					bot.sendMessage(chatId, `O id do seu chat é ${chatId}`)
		  		}

			}); 
		}
	}

  	if (dado.bke_alarmes_telegram.habilita == 1) {

  		if (dado.bke_alarmes_telegram.tipo == "digitalon") {

  			if (dado.device_modbus_read_id != 0) {
  		  			master.master.readHoldingRegisters(dado.device_modbus_read_id, dado.device_modbus_read_reg, 1).then(function(resp) {
		  				if (resp == 1) {
		  					if (objGlobal.confirmacao[index] != objGlobal.resp[index]) {
				  				idchat = dado.bke_alarmes_telegram.bot.idchat
		  						var msg = `Alerta equipamento ${dado.descricao}\n\nHora: ${moment().format("DD/MM/YYYY HH:mm:ss")}\nMensagem: ${dado.bke_alarmes_telegram.texton}\n\nConfirme se recebeu está mensagem(/sim).`
		  						bot.sendMessage(idchat, msg)
		  						objGlobal.resp[index] = resp
								objGlobal.confirmacao[index] = resp
								teste(objGlobal.resp[index], index, idchat)
								limparAviso()
								avisarNovamente(msg, idchat, index)
							}
	  					}else{
		  						objGlobal.resp[index] = 0
		  					}

		  			})
	  			
  			}else{

  				var result = modbusSerialFC3.queryModbusLocal(dado.device_modbus_read_id, dado.device_modbus_read_reg, 1).payload[0]

  				if (objGlobal.val[index] != result) {
  					
  					if (result == 1) {

		  				idchat = dado.bke_alarmes_telegram.bot.idchat
  						var msg = `Alerta equipamento ${dado.descricao}\n\nHora: ${moment().format("DD/MM/YYYY HH:mm:ss")}\nMensagem: ${dado.bke_alarmes_telegram.texton}\n\nConfirme se recebeu está mensagem(/sim).`
  						bot.sendMessage(idchat, msg)
	  					objGlobal.val[index] = result


						objGlobal.confirmacao[index] = result

						teste(result, index, idchat)

						limparAviso()
						avisarNovamente(msg, idchat,index)

  					}else{
  						objGlobal.val[index] = result
  					}

  				}else{
  					objGlobal.val[index] = result
  				}

  			}

  		}else if (dado.bke_alarmes_telegram.tipo == "digitaloff") {


  			if (dado.device_modbus_read_id != 0) {

	  			master.master.readHoldingRegisters(dado.device_modbus_read_id, dado.device_modbus_read_reg, 1).then(function(resp) {
	  				if (resp == 0) {
	  					console.log('objGlobal.confirmacao[index]: ',objGlobal.confirmacao[index][0])
	  					console.log('objGlobal.resp[index]: ',objGlobal.resp[index])
	  					if (objGlobal.confirmacao[index] != objGlobal.resp[index]) {

			  				idchat = dado.bke_alarmes_telegram.bot.idchat
	  						var msg = `Alerta equipamento ${dado.descricao}\n\nHora: ${moment().format("DD/MM/YYYY HH:mm:ss")}\nMensagem: ${dado.bke_alarmes_telegram.textoff}\n\nConfirme se recebeu está mensagem(/sim).`
	  						bot.sendMessage(idchat, msg)

		  						objGlobal.resp[index] = resp
								objGlobal.confirmacao[index] = resp

							teste(result, index, idchat)

							limparAviso()
							avisarNovamente(msg, idchat, index)
					}else{
						objGlobal.resp[index] = 0
					}

  					}
	  			})

  			}else{

  				var result = modbusSerialFC3.queryModbusLocal(dado.device_modbus_read_id, dado.device_modbus_read_reg, 1).payload[0]

  				if (objGlobal.val[index] != result) {
  					
  					if (result == 0) {

		  				idchat = dado.bke_alarmes_telegram.bot.idchat
  						var msg = `Alerta equipamento ${dado.descricao}\n\nHora: ${moment().format("DD/MM/YYYY HH:mm:ss")}\nMensagem: ${dado.bke_alarmes_telegram.textoff}\n\nConfirme se recebeu está mensagem(/sim).`
  						bot.sendMessage(idchat, msg)
	  					objGlobal.val[index] = result

						objGlobal.confirmacao[index] = result

						teste(result, index, idchat)

						limparAviso()
						avisarNovamente(msg, idchat,index)
  					}else{
  						objGlobal.val[index] = result
  					}

  				}else{
  					objGlobal.val[index] = result
  				}

  			}

  		}else if (dado.bke_alarmes_telegram.tipo == "analogico") {

			var result = modbusSerialFC3.queryModbusLocal(dado.device_modbus_read_id, dado.device_modbus_read_reg, 1).payload[0]

			if (objGlobal.val[index] != result) {
				// console.log(result)
		  		idchat = dado.bke_alarmes_telegram.bot.idchat
		  		if (dado.bke_alarmes_telegram.habilitahh && result >= dado.bke_alarmes_telegram.valorhh) {

					objGlobal.val[index] = result

					var msg = `Alerta equipamento ${dado.descricao}.\n\nHora: ${moment().format("DD/MM/YYYY HH:mm:ss")}\nValor atingido: ${result}\nMensagem: ${dado.bke_alarmes_telegram.textohh}\n\nConfirme se recebeu está mensagem(/sim).`
					bot.sendMessage(idchat, msg)
					objGlobal.confirmacao[index] = result

					teste(result, index, idchat)

					limparAviso()
					avisarNovamente(msg, idchat, index)
			
		  		}else if (dado.bke_alarmes_telegram.habilitah && result >= dado.bke_alarmes_telegram.valorh) {

					objGlobal.val[index] = result
					
					var msg = `Alerta equipamento ${dado.descricao}.\n\nHora: ${moment().format("DD/MM/YYYY HH:mm:ss")}\nValor atingido: ${result}\nMensagem: ${dado.bke_alarmes_telegram.textoh}\n\nConfirme se recebeu está mensagem(/sim).`
					bot.sendMessage(idchat, msg)
					objGlobal.confirmacao[index] = result

					teste(result, index, idchat)

					limparAviso()
					avisarNovamente(msg, idchat, index)

		 		}else if (dado.bke_alarmes_telegram.habilitall && dado.bke_alarmes_telegram.valorll >= result) {

					objGlobal.val[index] = result
					
					var msg = `Alerta equipamento ${dado.descricao}.\n\nHora: ${moment().format("DD/MM/YYYY HH:mm:ss")}\nValor atingido: ${result}\nMensagem: ${dado.bke_alarmes_telegram.textoll}\n\nConfirme se recebeu está mensagem(/sim).`
					bot.sendMessage(idchat, msg)
					objGlobal.confirmacao[index] = result

					teste(result, index, idchat)

					limparAviso()
					avisarNovamente(msg, idchat, index)

		  		}else if (dado.bke_alarmes_telegram.habilital && dado.bke_alarmes_telegram.valorl >= result) {

					objGlobal.val[index] = result

					var msg = `Alerta equipamento ${dado.descricao}.\n\nHora: ${moment().format("DD/MM/YYYY HH:mm:ss")}\nValor atingido: ${result}\nMensagem: ${dado.bke_alarmes_telegram.textol}\n\nConfirme se recebeu está mensagem(/sim).`
					bot.sendMessage(idchat, msg)
					objGlobal.confirmacao[index] = result

					teste(result, index, idchat)

					limparAviso()
					avisarNovamente(msg, idchat, index)

			  	}else{
					objGlobal.val[index] = result
			  	}
			}
		}
  	}
}

function teste(d, index, idchat){

	bot.on("message", function(msg) {
		const chat = msg.chat.id

		if (idchat == chat) {
			if (d == objGlobal.confirmacao[index]) {
				const text = msg.text.toLowerCase()
				console.log('dddddd')
				if (text == "/sim") {
					bot.sendMessage(chat,"Obrigado pela confirmação.")
					limparAviso()
					return
				}else{
					return
				}
			}else{
				return
			}
		}else{
			return
		}

	})

}



setInterval(function() {
  listarAlarmes()
}, 1000)

module.exports = { botToken, alertTeste, stopBot }