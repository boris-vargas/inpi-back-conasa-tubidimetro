const master = require('../../api/modbus/modbusSerialConfig')
const modbusLocal = require('../../api/modbus/modbusLocal')
const searchNodes = require('../../api/modbus/searchNodes')

//======================================================
//Query modbus API http (GET)
//======================================================
function writeModbus(req,res,next){
	var id = req.params.id
	var registro = req.params.registro
	var valor = req.params.valor
	var search = req.params.search
//===========================================
//Enquanto estiver procurando por elemento na rede
//descarta solicitação que nao seja da procura
//===========================================
if (searchNodes.getStatusSearch() && search=='0'){
	return
}
//===========================================
// Escravo > 0 (Módulos de IO)
//===========================================
if (id > 0){
	modbusLocal.addFailList(id)
	if (modbusLocal.getFailList(id)<=modbusLocal.getTimeoutCont()) {
		master.master.writeSingleRegister(id, registro, valor,1).then(function(success) {
			modbusLocal.setFailList(id,0)
					 res.status(200).send({
					 		result: "write modules done escravo:"+id,
					 		value:dados
					 	})
		}).catch(function(err){
			console.log(`Metodo GET writeSingleRegister - Debug Modbus ID->${id} - Debug Modbus->${err.name}`)
			modbusLocal.addFailList(id)
					res.status(500).send({
							result: "Timeout escravo: "+id,
							error:true,
							desc:err
						})
		})
	}else{

		res.status(500).send({
			result:'slave '+id+' desabilitado por excesso de timeout',
			errorDisable:true
		})	
	}
}else {
//===========================================
// Escravo = 0 (Registros da CPU)
//===========================================
	res.status(201).send(modbusLocal.modbusLocalWriteHoldReg(registro,valor))
	}
}
//======================================================
//Query modbus API http (POST)
//======================================================
function writeModbusMultiplesPost(req,res,next){
	var id = req.body.id
	var ini = parseInt(req.body.ini)
	var search = req.body.search	
	var dados
	var retry = req.body.enableretry
//===========================================
//Verifica formato do dado de escrita
//===========================================
	if(Array.isArray(req.body.dados)){
		dados = req.body.dados
	} else if(typeof req.body.dados=='object'){
		dados = req.body.dados.data
	}else{
		return res.status(500).send({
						result:'slave '+id+' formato da variável de escrita incorreto ('+typeof req.body.dados+') - aceito array ou buffer',
						errorFormat:true
					})	
	}
//===========================================
//Enquanto estiver procurando por elemento na rede
//descarta solicitação que nao seja da procura
//===========================================
if (searchNodes.getStatusSearch() && search=='0'){
	return
}
	if (req.method=='POST'){	

		if (id > 0){
			
			if(retry){
        		modbusLocal.setFailList(id,0)
      		}
			
			if (modbusLocal.getFailList(id)<=modbusLocal.getTimeoutCont()) {
				master.master.writeMultipleRegisters(id, ini, dados,1).then(function(success){
					modbusLocal.setFailList(id,0)
					 res.status(201).send({
					 		result: "write modules done escravo:"+id,
					 		value:dados
					 	})

				}).catch(function(err){
					console.log(`Metodo POST writeMultipleRegisters - Debug Modbus ID->${id} - Debug Modbus->${err.name}`)
					modbusLocal.addFailList(id)
					res.status(500).send({
							result: "Timeout escravo: "+id,
							error:true,
							desc:err
						})
			})
			}else{
				res.status(500).send({
					result:'slave '+id+' desabilitado por excesso de timeout',
					errorDisable:true
				})	
			}

		}else{
			//===========================================
			// Escravo = 0 (Registros da CPU)
			//===========================================
			return res.status(201).send(modbusLocal.modbusLocalWriteHoldRegMultiples(ini,dados.length,dados))
		}

	}else{
		return res.status(200).send({method:'ok'})
	}		
}
//======================================================
//Query modbus API http (POST)
//======================================================
function writeModbusPost(req,res,next){
	var id = req.body.id
	var registro = req.body.registro
	var valor = req.body.valor
	var search = req.body.search
	var retry = req.body.enableretry
	//===========================================
	//Enquanto estiver procurando por elemento na rede
	//descarta solicitação que nao seja da procura
	//===========================================
	if (searchNodes.getStatusSearch() && search=='0'){
		return
	}

	if (req.method=='POST'){	
		if (id > 0){

			if(retry){
        		modbusLocal.setFailList(id,0)
      		}
      		
			if (modbusLocal.getFailList(id)<=modbusLocal.getTimeoutCont()) {
				master.master.writeSingleRegister(id, registro, valor,1).then(function(success){
					modbusLocal.setFailList(id,0)
					res.status(201).send({
								result: "write modules done escravo:"+id,
								value:valor
							})

				}).catch(function(err){
					console.log(`Metodo POST writeSingleRegister - Debug Modbus ID->${id} - Debug Modbus->${err.name}`)
					modbusLocal.addFailList(id)
					res.status(500).send({
						result: "Timeout escravo: "+id,
						error:true,
						desc:err
					})
				})
			}else{
				res.status(500).send({
					result:'slave '+id+' desabilitado por excesso de timeout',
					errorDisable:true
				})	
			}
		}else {
			//===========================================
			// Escravo = 0 (Registros da CPU)
			//===========================================	
			res.status(201).send(modbusLocal.modbusLocalWriteHoldReg(registro,valor))
		}

}else{
	return res.status(201).send({method:'ok'})
}

}

//======================================================
//Write modbus local
//======================================================
function writeModbusLocal(id,registro,valor){

	if (id > 0){
		master.master.writeSingleRegister(id, registro, valor).then((data) => {
			return {result: "write modules done"}
		}, (err) => {
			return err
		});
	}else {
		return modbusLocal.modbusLocalWriteHoldReg(registro,valor)

	}
}

module.exports = {writeModbus, writeModbusLocal, writeModbusPost, writeModbusMultiplesPost}
