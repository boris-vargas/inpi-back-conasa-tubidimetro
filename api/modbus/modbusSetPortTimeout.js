const filelocal = require('../../api/files/filesLocal')
//======================================================
//verifica login
//======================================================
const setConfigModbusPort = (req, res, next) => {
	if (req.method=='POST'){
		const jsonConfig =  req.body
		console.log(jsonConfig)
		filelocal.writeToFile('serialConfig.json',JSON.stringify(jsonConfig))
		return res.status(201).send({valid: 'ok', status:'configuracoes salvas'})
	}else{
		return res.status(201).send({valid: 'ok'})
	}
}

module.exports = {setConfigModbusPort}
