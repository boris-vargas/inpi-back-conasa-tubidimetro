const moment = require('moment')
const mysqlComp = require('../../config/database')
const plataforma = process.platform
const modbusSerialFC3 = require('../../api/modbus/modbusSerialFC3')
const master = require('../../api/modbus/modbusSerialConfig')
var logComponentes = [{}]
var cmdSql

//============================================================================================
//Cria tabela de log do componente
//============================================================================================
function insertNewTableLog(idTableName){
  var cmdSql =
  `
  CREATE TABLE IF NOT EXISTS   \`iot\`.\`log_${idTableName}\` (
    \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
    \`timestamp\` timestamp NOT NULL,
    \`descricao\` varchar(45) NOT NULL,
    \`valor\` decimal(10,2) NOT NULL,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
  `
  mysqlComp.query(cmdSql, function (err, result){
    if(err) {
      console.log('Erro Create mySql log :'+err);
    }else {
      //console.log('OK Create mySql log - ',result);
      cmdSql = `UPDATE config_compontes SET 
          nome_tabela_log='log_${idTableName}'

          WHERE id=${idTableName}

          `
        mysqlComp.query(cmdSql, function (err, result){
          if (err) {
            console.log('erro na atualização do nome da tabela')
          }else{

        }

      })   
    }
  })

}
//============================================================================================
//Delete tabela de log do componente
//============================================================================================
function deleteCompLog(tableName){
  var numb = tableName.match(/\d/g);
  numb = numb.join("");
  console.log(numb)
  
  var cmdSql =
  `
  DROP TABLE \`${tableName}\`
  `
  mysqlComp.query(cmdSql, function (err, result){
    if(err) {
      console.log('Erro Delete mySql log :'+err);
    }else {

    }
  })
}
//============================================================================================
//Colsulta tabela componentes e vefirica se tem log
//============================================================================================
function verifyCompLog(){
  var count = 0
  logComponentes = [{}]
  const cmdSql =
  `
  SELECT id,descricao,log_tempo,mudanca_estado,banda_morta,device_modbus_read_id,
          device_modbus_read_reg, fator, log FROM config_compontes ORDER by id
  `
    mysqlComp.query(cmdSql, function (err, result){
    if(err) {
      console.log('Erro Create mySql log :'+err);
    }else {
      for (var i = 0; i < result.length; i++) {
        if (result[i].log==1){
          insertNewTableLog(result[i].id)
          logComponentes.push({
            descricao: result[i].descricao,
            log_tempo:result[i].log_tempo,
            mudanca_estado:result[i].mudanca_estado,
            banda_morta:result[i].banda_morta,
            device_modbus_read_id:result[i].device_modbus_read_id,
            device_modbus_read_reg: result[i].device_modbus_read_reg,
            timer:0,
            tableName:`log_${result[i].id}`,
            fator: result[i].fator,
            log: result[i].log

          })
        }
      }
    }
  })
}
verifyCompLog()

//============================================================================================
//Verifica se tem log a cada segundo
//============================================================================================
setInterval(function(){
  for (var i = 0; i < logComponentes.length; i++) {
    if(logComponentes[i].log){
      runLog(i)
    }
  }
},1000)

//============================================================================================
//Insere log
//============================================================================================
function insertLog(tableName, descricao, dataValue){
  const cmdSql =
  ` INSERT INTO \`iot\`.\`${tableName}\` (timestamp,descricao, valor) VALUES ('${moment().utcOffset(-180).format('YYYY-MM-DD HH:mm:ss')}', '${descricao}', '${dataValue}')
  `
  mysqlComp.query(cmdSql, function (err, result){
    if(err) {
      console.log('Erro Create mySql log (insertLog) :'+err);
    }else {

    }
  })
}
//============================================================================================
//Verifica e executa log
//============================================================================================
var dataCkeckChange = new Array(250).fill(0)
var valueChangeVerify = 0

function runLog(index){
  /*=================================================*/
  /*Grava logs por mudança de estado e banda morta*/
  /*=================================================*/
  if (logComponentes[index].device_modbus_read_id==0 && logComponentes[index].mudanca_estado) {
    var dataValue =  modbusSerialFC3.queryModbusLocal(logComponentes[index].device_modbus_read_id,logComponentes[index].device_modbus_read_reg,1).payload*logComponentes[index].fator 
    if(dataValue!=dataCkeckChange[index]){
      //console.log('change')
      valueChangeVerify  = (dataValue - dataCkeckChange[index]) < 0 ? (dataCkeckChange[index] - dataValue) : (dataValue - dataCkeckChange[index])    
      if(valueChangeVerify >= logComponentes[index].banda_morta){
           // console.log('++++++++++++++++++++++++++++++++++')
           // console.log('gravei por datachange > 0')
           // console.log(logComponentes[index].descricao)
           // console.log('diferença',valueChangeVerify)
           // console.log('banda morta',logComponentes[index].banda_morta)
        dataCkeckChange[index] = dataValue
        insertLog(logComponentes[index].tableName, logComponentes[index].descricao, dataValue)
      }
    }  
  }
  if (logComponentes[index].device_modbus_read_id>0 && logComponentes[index].mudanca_estado) {
    master.master.readHoldingRegisters(logComponentes[index].device_modbus_read_id,logComponentes[index].device_modbus_read_reg,1).then(function(data){
      var dataValue =  data[0]*logComponentes[index].fator
      if(dataValue!=dataCkeckChange[index]){
        //console.log('change')
        valueChangeVerify  = (dataValue - dataCkeckChange[index]) < 0 ? (dataCkeckChange[index] - dataValue) : (dataValue - dataCkeckChange[index])    
        if(valueChangeVerify >= logComponentes[index].banda_morta){
           // console.log('++++++++++++++++++++++++++++++++++')
           // console.log('gravei por datachange > 0')
           // console.log(logComponentes[index].descricao)
           // console.log('diferença',valueChangeVerify)
           // console.log('banda morta',logComponentes[index].banda_morta)
          dataCkeckChange[index] = dataValue
          insertLog(logComponentes[index].tableName, logComponentes[index].descricao, dataValue)

        }
      }
    }).catch(function(err){
      console.log(`Metodo readHoldingRegisters tasks/log por banda morta- Debug Modbus ID->${logComponentes[index].device_modbus_read_id} - Debug Modbus-> Timeout`)
    })
  }
  /*=================================================*/
  /*Grava logs por tempo predefinido*/
  /*=================================================*/
  if (logComponentes[index].timer >= (logComponentes[index].log_tempo-1) && !logComponentes[index].mudanca_estado) {

    if (logComponentes[index].device_modbus_read_id!=0) {
      master.master.readHoldingRegisters(logComponentes[index].device_modbus_read_id,logComponentes[index].device_modbus_read_reg,1).then(function(data){
        insertLog(logComponentes[index].tableName, logComponentes[index].descricao, (data[0]*logComponentes[index].fator))
        // console.log('++++++++++++++++++++++++++++++++++++')
        // console.log('gravei por tempo > 0')
        // console.log(logComponentes[index].descricao)      
      }).catch(function(err){
      console.log(`Metodo readHoldingRegisters tasks/log por tempo- Debug Modbus ID->${logComponentes[index].device_modbus_read_id} - Debug Modbus-> Timeout`)
    })
    }else{
      var dataValue =  modbusSerialFC3.queryModbusLocal(logComponentes[index].device_modbus_read_id,logComponentes[index].device_modbus_read_reg,1).payload*logComponentes[index].fator 
      insertLog(logComponentes[index].tableName, logComponentes[index].descricao, dataValue)
    }       
    logComponentes[index].timer = 0
    return
  }
  logComponentes[index].timer++
}

console.log('Task Log Module iniciado em :'+moment().utcOffset(-180).format());

module.exports = {verifyCompLog, deleteCompLog}
