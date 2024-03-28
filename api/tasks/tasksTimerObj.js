const mysqlComp = require('../../config/database')
const moment = require('moment')
const modbusLocal = require('../../api/modbus/modbusLocal')
const modbusSerialFC3 = require('../../api/modbus/modbusSerialFC3')
const modbusSerialFC16 = require('../../api/modbus/modbusSerialFC16')

//======================================================
//get configuração no inicio da aplicação
//======================================================
var componentes = []
function updateTaskObjects(){
	const cmdSql = "SELECT bke_tasks, tipo FROM config_compontes"
	mysqlComp.query(cmdSql, function (err, result){
		componentes = result
		//console.log('compoente->',componentes);
	})
}
updateTaskObjects()

function updateTaskObjectsVar(){
	return componentes
}


setInterval(function(){
	// console.log('+++++++++++++++++++++++++++++++++++')
	// console.log(moment().utcOffset(-180).format('HH'))
	// console.log(moment().utcOffset(-180).format('mm'))
	// console.log(moment().utcOffset(-180).format('ss'))
	// console.log(moment().utcOffset(-180).format('DD'))
	// console.log(moment().utcOffset(-180).format('x'))
	// console.log('+++++++++++++++++++++++++++++++++++')

	//const dateNow = new Date()//moment().utcOffset(-180)//new Date()
	modbusLocal.modbusLocalWriteHoldReg(1099,moment().utcOffset(-180).format('x'))
	const sisHora = moment().utcOffset(-180).format('HH')
	const sisMin = moment().utcOffset(-180).format('mm')
	const sisSeg = moment().utcOffset(-180).format('ss')
	const sisDiaSemana = moment().utcOffset(-180).day()
	//console.log(moment().utcOffset(-180))

	var dadosTask  = componentes
	var dadosTaskParseJSON = []
	var resultDiaLiga = false
	var resultDiaDesliga = false

	if (dadosTask) {
		for (var i = 0; i < dadosTask.length; i++) {
			if (dadosTask[i].tipo=='task-horario')
			//console.log(dadosTask[i].bke_tasks)
			dadosTaskParseJSON.push(JSON.parse(dadosTask[i].bke_tasks))
		}
		// console.log(dadosTaskParseJSON);
		// console.log('-------------------------');
		// console.log('local hora: '+sisHora);
		// console.log('local min: '+sisMin);
		// console.log('local seg: '+sisSeg);
		// console.log('local dia: '+sisDiaSemana);

		//++++++++++++++++++++++++++++++++++++++++++++++
		//loop para objetos
		for (var i = 0; i < dadosTaskParseJSON.length; i++) {
			//++++++++++++++++++++++++++++++++++++++++++++++
			//loop para objetos - hora liga
			//++++++++++++++++++++++++++++++++++++++++++++++
			//	console.log('Tamanho hora liga: '+dadosTaskParseJSON[i].horaLiga.length);
			for (var j = 0; j < dadosTaskParseJSON[i].horaLiga.length; j++) {
				if (dadosTaskParseJSON[i].horaLiga[j].hora){
					const horaLigaLocalTime = moment(dadosTaskParseJSON[i].horaLiga[j].hora).local().utc(-0).format()
					const horaLigaHora = new Date(horaLigaLocalTime)
					const ligaHora = horaLigaHora.getHours()
					const ligaMin = horaLigaHora.getMinutes()
					const ligaSeg= horaLigaHora.getSeconds()
					//
					// console.log('hora->',ligaHora);
					// console.log('minuto->',ligaMin);
					// console.log('segundo->',ligaSeg);

					//++++++++++++++++++++++++++++++++++++++++++++++
					//verifica dia da semana
					//++++++++++++++++++++++++++++++++++++++++++++++
					resultDiaLiga = false
					for (var l = 0; l < 7; l++) {
						if (dadosTaskParseJSON[i].horaLiga[j].diaSemana) {
							if ((sisDiaSemana==l) && (dadosTaskParseJSON[i].horaLiga[j].diaSemana[l]==true)) {
								resultDiaLiga = true
							}

						}
						//console.log(dadosTaskParseJSON[i].horaLiga[j].diaSemana[l]);
					}
					//++++++++++++++++++++++++++++++++++++++++++++++
					//verifica se task hora liga e escreve em registro
					//++++++++++++++++++++++++++++++++++++++++++++++
					// console.log('sisHora: ',sisHora)
					// console.log('ligaHora: ',ligaHora)
					// console.log('sisMin: ',sisMin)
					// console.log('ligaMin: ',ligaMin)
					// console.log('sisMin: ',sisMin)
					// console.log('ligaSeg: ',ligaSeg)
					// console.log('resultDiaLiga: ',resultDiaLiga)
					// console.log('sisDiaSemana: ',sisDiaSemana)
					if ((sisHora==ligaHora) && (sisMin==ligaMin) && (sisSeg==ligaSeg) && (resultDiaLiga)) {
						//console.log('passei no evento do objeto: '+ i+ " - Hora liga index: "+j);
						for (var k = 0; k < dadosTaskParseJSON[i].tagsWriteOn.length; k++) {
							if (typeof dadosTaskParseJSON[i].tagsWriteOn[k].selectObj != 'undefined'){

							if (dadosTaskParseJSON[i].tagsWriteOn[k].selectObj.tipo != 'generico'){
								//console.log('id: '+dadosTaskParseJSON[i].tagsWriteOn[k].id + ' Registro: '+ dadosTaskParseJSON[i].tagsWriteOn[k].reg + ' Valor: '+ dadosTaskParseJSON[i].tagsWriteOn[k].valor);
								modbusSerialFC16.writeModbusLocal(dadosTaskParseJSON[i].tagsWriteOn[k].selectObj.device_modbus_write_id,dadosTaskParseJSON[i].tagsWriteOn[k].selectObj.device_modbus_write_reg, 1)//dadosTaskParseJSON[i].tagsWriteOn[k].valor
							}
							if (dadosTaskParseJSON[i].tagsWriteOn[k].selectObj.tipo == 'generico'){
								//console.log('id: '+dadosTaskParseJSON[i].tagsWriteOn[k].id + ' Registro: '+ dadosTaskParseJSON[i].tagsWriteOn[k].reg + ' Valor: '+ dadosTaskParseJSON[i].tagsWriteOn[k].valor);
								modbusSerialFC16.writeModbusLocal(dadosTaskParseJSON[i].tagsWriteOn[k].id,dadosTaskParseJSON[i].tagsWriteOn[k].reg, dadosTaskParseJSON[i].tagsWriteOn[k].valor)//dadosTaskParseJSON[i].tagsWriteOn[k].valor
							}
						}

						}
					}
				}
			}
			//++++++++++++++++++++++++++++++++++++++++++++++
			//loop para objetos - hora desliga
			//++++++++++++++++++++++++++++++++++++++++++++++
			for (var j = 0; j < dadosTaskParseJSON[i].horaDesliga.length; j++) {
				if (dadosTaskParseJSON[i].horaDesliga[j].hora){
					const horaDesligaLocalTime = moment(dadosTaskParseJSON[i].horaDesliga[j].hora).local().utc(-0).format()
					const horaDesligaHora = new Date(horaDesligaLocalTime)
					const desligaHora = horaDesligaHora.getHours()
					const desligaMin = horaDesligaHora.getMinutes()
					const desligaSeg= horaDesligaHora.getSeconds()
					//++++++++++++++++++++++++++++++++++++++++++++++
					//verifica dia da semana desliga
					//++++++++++++++++++++++++++++++++++++++++++++++
					resultDiaDesliga = false
					for (var m = 0; m < 7; m++) {
						if (dadosTaskParseJSON[i].horaDesliga[j].diaSemana) {
							if ((sisDiaSemana==m) && (dadosTaskParseJSON[i].horaDesliga[j].diaSemana[m]==true)) {
								resultDiaDesliga = true
							}
						}
					}
					//++++++++++++++++++++++++++++++++++++++++++++++
					//verifica se task hora desliga e escreve em registro
					//++++++++++++++++++++++++++++++++++++++++++++++
					if ((sisHora==desligaHora) && (sisMin==desligaMin) && (sisSeg==desligaSeg) && (resultDiaDesliga)) {
						//console.log('passei no evento do objeto: '+ i+ " - Hora desliga index: "+j);
						for (var k = 0; k < dadosTaskParseJSON[i].tagsWriteOff.length; k++) {
							if (typeof dadosTaskParseJSON[i].tagsWriteOff[k].selectObj != 'undefined'){
							if (dadosTaskParseJSON[i].tagsWriteOff[k].selectObj.tipo != 'generico'){
								//console.log('id: '+dadosTaskParseJSON[i].tagsWriteOn[k].id + ' Registro: '+ dadosTaskParseJSON[i].tagsWriteOn[k].reg + ' Valor: '+ dadosTaskParseJSON[i].tagsWriteOn[k].valor);
								modbusSerialFC16.writeModbusLocal(dadosTaskParseJSON[i].tagsWriteOff[k].selectObj.device_modbus_write_id,dadosTaskParseJSON[i].tagsWriteOff[k].selectObj.device_modbus_write_reg, 0)//dadosTaskParseJSON[i].tagsWriteOn[k].valor
							}
							if (dadosTaskParseJSON[i].tagsWriteOff[k].selectObj.tipo == 'generico'){
								//console.log('id: '+dadosTaskParseJSON[i].tagsWriteOn[k].id + ' Registro: '+ dadosTaskParseJSON[i].tagsWriteOn[k].reg + ' Valor: '+ dadosTaskParseJSON[i].tagsWriteOn[k].valor);
								modbusSerialFC16.writeModbusLocal(dadosTaskParseJSON[i].tagsWriteOff[k].id,dadosTaskParseJSON[i].tagsWriteOff[k].reg, dadosTaskParseJSON[i].tagsWriteOff[k].valor)//dadosTaskParseJSON[i].tagsWriteOn[k].valor
							}
						}
						}
					}
				}
			}
		}
	}

},800)

console.log('Task Timer Module iniciado em :'+moment().utc(-3).format());

module.exports = {updateTaskObjects}
