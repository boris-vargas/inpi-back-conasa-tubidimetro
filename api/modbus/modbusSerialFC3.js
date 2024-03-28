
const master = require('../../api/modbus/modbusSerialConfig')
const modbusLocal = require('../../api/modbus/modbusLocal')
const searchNodes = require('../../api/modbus/searchNodes')
const plataforma = process.platform
//======================================================
//Query API http
//======================================================
function queryModbus(req,res,next){
  var id = req.params.id
  var inicio = req.params.inicio
  var quant = req.params.quant
  var search = req.params.search

//===========================================
//Enquanto estiver procurando por elemento na rede
//descarta solicitação que nao seja da procura
//===========================================
if (searchNodes.getStatusSearch() && search=='0'){
  return
}

// if (!master) {
//   res.status(500).send({"message":"Erro na abertura da porta COM","name":"ModbusResponseTimeout"})
// }

if (id > 0){
  if (modbusLocal.getFailList(id)<=modbusLocal.getTimeoutCont()) {

    master.master.readHoldingRegisters(id, inicio, quant).then(function(data){
      modbusLocal.setFailList(id,0)
      res.status(201).send({
        result: "read modules done escravo:"+id,
        value:data
      })
    }).catch(function(err){
      console.log(`Metodo GET readHoldingRegisters - Debug Modbus ID->${id} - Debug Modbus->${err.name}`);
      modbusLocal.addFailList(id)
       res.status(500).send(err)
    })
  }else{
    res.status(500).send({name:'ModbusResponseTimeout'})
  }
}else {
  res.status(500).send(modbusLocal.modbusLocalReadHoldReg(inicio,quant))
}
}
//======================================================
//Query mysql API http
//======================================================
function queryModbusLocal(id,inicio,quant){
  if (id > 0){
    master.master.readHoldingRegisters(id, inicio, quant).then(function(data){
      return data
    }).catch(function(err){
      console.log(`Metodo readHoldingRegisters queryModbusLocal - Debug Modbus ID->${id} - Debug Modbus-> Timeout`)
      return err
    })
  }else {
    return modbusLocal.modbusLocalReadHoldReg(inicio,quant)
  }
}
//======================================================
//Query mysql API http
//======================================================
function readModbusPost(req,res,next){
  var id = req.body.id
  var inicio = req.body.inicio
  var quant = req.body.quant
  var retry = req.body.enableretry

  if (req.method=='POST'){
    // if (!master) {
    //   res.status(500).send({"message":"Erro na abertura da porta COM","name":"ModbusResponseTimeout"})
    // }
    if (id > 0){
      if(retry){
        modbusLocal.setFailList(id,0)
      }
      if (modbusLocal.getFailList(id)<=modbusLocal.getTimeoutCont()) {
         master.master.readHoldingRegisters(id, inicio, quant).then(function(success){
          modbusLocal.setFailList(id,0)
          res.status(201).send({
          result: "read modules done escravo:"+id,
          payload:success
        })
      }).catch(function(err){
        console.log(`Metodo POST readHoldingRegisters - Debug Modbus ID->${id} - Debug Modbus->${err.name}`)
          modbusLocal.addFailList(id)
          res.status(500).send({
              result: "Timeout escravo: "+id,
              error:true,
              desc:err
            })
      })

    }else{
        res.status(500).send({
        result:'slave '+id+' desabilitado por excesso de timeout - restart controler',
        errorDisable:true
    })
    
    }

    }else {
      res.status(200).send(modbusLocal.modbusLocalReadHoldReg(inicio,quant))
    }

  }else{
    return res.status(201).send({valid: 'ok'})
  }
}


module.exports = {queryModbus, queryModbusLocal, readModbusPost}






