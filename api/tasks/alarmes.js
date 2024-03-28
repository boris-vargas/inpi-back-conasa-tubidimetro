const moment = require('moment')
const mysqlComp = require('../../config/database')
const plataforma = process.platform
const modbusSerialFC3 = require('../../api/modbus/modbusSerialFC3')
const master = require('../../api/modbus/modbusSerialConfig')
const email = require('./email')
var alarmeComponentes = []
var cmdSql
var data_
var dataOn = []
var dataOn_
var dataOff
var dataOff_ = []
var cmdSqlt
var analogData = []
var analogData_
var risingDigOnLocal = new Array(2048).fill(true)
var risingDigOnRemoto = new Array(2048).fill(true)
var risingDigOffLocal = new Array(2048).fill(true)
var risingDigOffRemoto = new Array(2048).fill(true)

//============================================================================================
//Colsulta tabela componentes e vefirica se tem log
//============================================================================================
function verifyCompAlarmes(){
  var count = 0
  alarmeComponentes = []
  const cmdSql =
  `
  SELECT * FROM config_compontes ORDER by id
  `
  mysqlComp.query(cmdSql, function (err, result){
    if(err) {
      console.log('Erro Create mySql log :'+err);
    }else {
      //console.log(result);
      for (var i = 0; i < result.length; i++) {
        result[i].bke_alarmes = JSON.parse(result[i].bke_alarmes)
        //console.log('bke tewrtwtwret->',result[i].bke_alarmes);
        if (result[i].bke_alarmes.habilita==1){
          //console.log('compioentne alamre');
          //  console.log('compioentne alamre result',result[i]);
          //insertNewTableLog(result[i].id)
          alarmeComponentes.push({
            id: result[i].id,
            descricao: result[i].descricao,
            navegacao: result[i].menu_navegacao,
            device_modbus_read_id:result[i].device_modbus_read_id,
            device_modbus_read_reg: result[i].device_modbus_read_reg,
            device_modbus_write_id: result[i].device_modbus_write_id,
            device_modbus_write_reg: result[i].device_modbus_write_reg,
            fator: result[i].fator,
            bke_alarmes: result[i].bke_alarmes

          })
        }
      }
    }
  })
}
verifyCompAlarmes()
//============================================================================================
//Coloca email na fila para envio
//============================================================================================
function verifyAddEmail(almObject, text){
  //console.log(almObject)
  for (var i = 0; i < almObject.bke_alarmes.emails.length; i++) {
    if (almObject.bke_alarmes.emails[i].habilita) {
      email.addEmailAlm(almObject.bke_alarmes.emails[i].to, text)
    };
  };
}


//============================================================================================
//Verifica se tem log ciclicamente
//============================================================================================
setInterval(function(){
  for (var i = 0; i < alarmeComponentes.length; i++) {
    runAlarmes(i)

  }
},3000)

//============================================================================================
//Verifica e executa log
//============================================================================================
function runAlarmes(index){
  if (alarmeComponentes[index]){
  //============================================================================================
  //Trata digital ON quando endereço escravo > 0
  //============================================================================================
  if (alarmeComponentes[index].bke_alarmes.tipo =='digitalon') {

    if (alarmeComponentes[index].device_modbus_read_id!=0) {
      master.master.readHoldingRegisters(alarmeComponentes[index].device_modbus_read_id,alarmeComponentes[index].device_modbus_read_reg,1).then((dataOn) => {
        //console.log('dataon_ ->',dataOn);
        const cmdSql =` SELECT * FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
        mysqlComp.query(cmdSql, function (err, result){
          if(err) {
            //console.log('Erro Create mySql log :'+err);
          }else {
            if (result.length==0 && dataOn==1) {
              cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.texton}', '${dataOn}','${alarmeComponentes[index].descricao}', '${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadetexton}')`
              verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.texton}`)
              mysqlComp.query(cmdSqlt, function (err, result){
                risingDigOnLocal[index] = false
              })
            } else{
              if (dataOn==1) {
                cmdSqlt = `UPDATE alarmes SET valor='${dataOn}' WHERE id_componente='${alarmeComponentes[index].id}'`
                risingDigOnLocal[index] = false
                mysqlComp.query(cmdSqlt, function (err, result){
                })
              }else {
                if (!risingDigOnLocal[index]) {
                  insertHistAlms(alarmeComponentes[index].id)
                  cmdSqlt = `DELETE FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
                  //console.log(cmdSqlt);
                  risingDigOnLocal[index] = true
                  mysqlComp.query(cmdSqlt, function (err, result){
                  })

                }
              }
            }
          }
        })
      })
    }else {
      //============================================================================================
      //Trata digital ON quando endereço escravo == 0
      //============================================================================================
      dataOn[index] = modbusSerialFC3.queryModbusLocal(alarmeComponentes[index].device_modbus_read_id,alarmeComponentes[index].device_modbus_read_reg,1).payload*alarmeComponentes[index].fator
      const cmdSql =` SELECT * FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
      mysqlComp.query(cmdSql, function (err, result){
        if(err) {
          //console.log('Erro Create mySql log :'+err);
        }else {
          if (result.length==0 && dataOn[index]==1) {
            cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.texton}', '${dataOn[index]}','${alarmeComponentes[index].descricao}', '${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadetexton}')`
            verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.texton}`)
            mysqlComp.query(cmdSqlt, function (err, result){
              risingDigOnLocal[index] = false
            })
          } else{
            if (dataOn[index]==1) {
              cmdSqlt = `UPDATE alarmes SET valor='${dataOn[index]}' WHERE id_componente='${alarmeComponentes[index].id}'`
              //console.log(cmdSqlt);
              risingDigOnLocal[index] = false
              mysqlComp.query(cmdSqlt, function (err, result){
              })
            }else {
              if (!risingDigOnLocal[index]) {
                insertHistAlms(alarmeComponentes[index].id)
                cmdSqlt = `DELETE FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
                //console.log(cmdSqlt);
                risingDigOnLocal[index] = true
                mysqlComp.query(cmdSqlt, function (err, result){
                })

              }
            }
          }
        }
      })
    }
  }
  //============================================================================================
  //Trata digital OFF quando endereço escravo > 0
  //============================================================================================
  if (alarmeComponentes[index].bke_alarmes.tipo =='digitaloff') {

    if (alarmeComponentes[index].device_modbus_read_id!=0) {
      master.master.readHoldingRegisters(alarmeComponentes[index].device_modbus_read_id,alarmeComponentes[index].device_modbus_read_reg,1).then((dataOff) => {
        //console.log('dataon_ ->',dataOff);
        const cmdSql =` SELECT * FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
        mysqlComp.query(cmdSql, function (err, result){
          if(err) {
            //console.log('Erro Create mySql log :'+err);
          }else {
            if (result.length==0 && dataOff==0) {
              cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.textoff}', '${dataOff}','${alarmeComponentes[index].descricao}', '${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadetextoff}')`
              verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.textoff}`)
              mysqlComp.query(cmdSqlt, function (err, result){
                risingDigOnLocal[index] = false
              })
            } else{
              if (dataOff==0) {
                cmdSqlt = `UPDATE alarmes SET valor='${dataOff}' WHERE id_componente='${alarmeComponentes[index].id}'`
                //console.log(cmdSqlt);
                risingDigOnLocal[index] = false
                mysqlComp.query(cmdSqlt, function (err, result){
                })
              }else {
                if (!risingDigOnLocal[index]) {
                  insertHistAlms(alarmeComponentes[index].id)
                  cmdSqlt = `DELETE FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
                  //console.log(cmdSqlt);
                  risingDigOnLocal[index] = true
                  mysqlComp.query(cmdSqlt, function (err, result){
                  })

                }
              }
            }
          }
        })
      })
    }else {
      //============================================================================================
      //Trata digital OFF quando endereço escravo == 0
      //============================================================================================
      dataOff_[index] = modbusSerialFC3.queryModbusLocal(alarmeComponentes[index].device_modbus_read_id,alarmeComponentes[index].device_modbus_read_reg,1).payload*alarmeComponentes[index].fator
      const cmdSql =` SELECT * FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
      mysqlComp.query(cmdSql, function (err, result){
        if(err) {
          //console.log('Erro Create mySql log :'+err);
        }else {
          if (result.length==0 && dataOff_[index]==0) {
            cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.textoff}', '${dataOff_[index]}','${alarmeComponentes[index].descricao}', '${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadetextoff}')`
            verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.textoff}`)
            mysqlComp.query(cmdSqlt, function (err, result){
              risingDigOnLocal[index] = false
            })
          } else{
            if (dataOff_[index]==0) {
              cmdSqlt = `UPDATE alarmes SET valor='${dataOff_[index]}' WHERE id_componente='${alarmeComponentes[index].id}'`
              //console.log(cmdSqlt);
              risingDigOnLocal[index] = false
              mysqlComp.query(cmdSqlt, function (err, result){
              })
            }else {
              if (!risingDigOnLocal[index]) {
                insertHistAlms(alarmeComponentes[index].id)
                cmdSqlt = `DELETE FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
                //console.log(cmdSqlt);
                risingDigOnLocal[index] = true
                mysqlComp.query(cmdSqlt, function (err, result){
                })

              }
            }
          }
        }
      })
    }
  }

  //============================================================================================
  //Trata analógico quando endereço escravo > 0
  //============================================================================================
  if (alarmeComponentes[index].bke_alarmes.tipo =='analogico') {
    //console.log('analologicos');
    if (alarmeComponentes[index].device_modbus_read_id!=0) {
      //console.log('REMOTO');
      master.master.readHoldingRegisters(alarmeComponentes[index].device_modbus_read_id,alarmeComponentes[index].device_modbus_read_reg,1).then((analogData_) => {
      analogData_*=alarmeComponentes[index].fator
        //============================================================================================
        //Trata analogico quando endereço escravo != 0
        //============================================================================================
        const cmdSql =` SELECT * FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
        //console.log(cmdSql);
        mysqlComp.query(cmdSql, function (err, result){
          if(err) {
            //console.log('Erro Create mySql log :'+err);
          }else {
            if (result.length==0 && (analogData_<=alarmeComponentes[index].bke_alarmes.valorll) && (alarmeComponentes[index].bke_alarmes.habilitall)) {
              cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.textoll}', '${analogData_}','${alarmeComponentes[index].descricao}','${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadell}')`
              verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.textoll}`)
              mysqlComp.query(cmdSqlt, function (err, result){
                //console.log('result->',result);
                //console.log('result->',err);
              })
            }

            if (result.length==0 && (analogData_<=alarmeComponentes[index].bke_alarmes.valorl) && (analogData_>alarmeComponentes[index].bke_alarmes.valorll || !alarmeComponentes[index].bke_alarmes.habilitall) && (alarmeComponentes[index].bke_alarmes.habilital)) {
              cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.textol}', '${analogData_}','${alarmeComponentes[index].descricao}','${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadel}')`
              verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.textol}`)
              mysqlComp.query(cmdSqlt, function (err, result){
                //console.log('result->',result);
                //console.log('result->',err);
              })
            }

            if (result.length==0 && (analogData_>alarmeComponentes[index].bke_alarmes.valorh) && (analogData_<alarmeComponentes[index].bke_alarmes.valorhh || !alarmeComponentes[index].bke_alarmes.habilitahh) && (alarmeComponentes[index].bke_alarmes.habilitah)) {
              cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.textoh}', '${analogData_}','${alarmeComponentes[index].descricao}','${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadeh}')`
              verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.textoh}`)
              mysqlComp.query(cmdSqlt, function (err, result){
                //console.log('result->',result);
                //console.log('result->',err);
              })
            }

            if (result.length==0 && (analogData_>=alarmeComponentes[index].bke_alarmes.valorhh) && (alarmeComponentes[index].bke_alarmes.habilitahh)) {
              cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.textohh}', '${analogData_}','${alarmeComponentes[index].descricao}','${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadehh}')`
              verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.textohh}`)
              mysqlComp.query(cmdSqlt, function (err, result){
                //console.log('result->',result);
                //console.log('result->',err);
              })
            }


            if(result.length>0){

              if ((analogData_<=alarmeComponentes[index].bke_alarmes.valorll) && (alarmeComponentes[index].bke_alarmes.habilitall)) {
                cmdSqlt = `UPDATE alarmes SET valor='${analogData_}' ,descricao='${alarmeComponentes[index].bke_alarmes.textoll}', prioridade='${alarmeComponentes[index].bke_alarmes.prioridadell}' WHERE id_componente='${alarmeComponentes[index].id}'`
                mysqlComp.query(cmdSqlt, function (err, result){})
              }

              else if ((analogData_<=alarmeComponentes[index].bke_alarmes.valorl) && (analogData_>alarmeComponentes[index].bke_alarmes.valorll || !alarmeComponentes[index].bke_alarmes.habilitall) && (alarmeComponentes[index].bke_alarmes.habilital)) {
                cmdSqlt = `UPDATE alarmes SET valor='${analogData_}', descricao='${alarmeComponentes[index].bke_alarmes.textol}', prioridade='${alarmeComponentes[index].bke_alarmes.prioridadel}' WHERE id_componente='${alarmeComponentes[index].id}'`
                mysqlComp.query(cmdSqlt, function (err, result){})
              }

              else if ((analogData_>alarmeComponentes[index].bke_alarmes.valorh) && (analogData_<alarmeComponentes[index].bke_alarmes.valorhh || !alarmeComponentes[index].bke_alarmes.habilitahh) && (alarmeComponentes[index].bke_alarmes.habilitah)) {
                cmdSqlt = `UPDATE alarmes SET valor='${analogData_}', descricao='${alarmeComponentes[index].bke_alarmes.textoh}', prioridade='${alarmeComponentes[index].bke_alarmes.prioridadeh}' WHERE id_componente='${alarmeComponentes[index].id}'`
                mysqlComp.query(cmdSqlt, function (err, result){})
              }

              else if ((analogData_>alarmeComponentes[index].bke_alarmes.valorhh) && (alarmeComponentes[index].bke_alarmes.habilitahh)) {
                cmdSqlt = `UPDATE alarmes SET valor='${analogData_}', descricao='${alarmeComponentes[index].bke_alarmes.textohh}',prioridade='${alarmeComponentes[index].bke_alarmes.prioridadehh}' WHERE id_componente='${alarmeComponentes[index].id}'`
                mysqlComp.query(cmdSqlt, function (err, result){})
              }

              else {
                insertHistAlms(alarmeComponentes[index].id)
                cmdSqlt = `DELETE FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
                mysqlComp.query(cmdSqlt, function (err, result){})
              }


            }
            //console.log('OK Create mySql log - ',result);
          }
        })
      })
    }else {
      //============================================================================================
      //Trata analogico quando endereço escravo == 0
      //============================================================================================
      //console.log('LOCAL');
      analogData[index] = modbusSerialFC3.queryModbusLocal(alarmeComponentes[index].device_modbus_read_id,alarmeComponentes[index].device_modbus_read_reg,1).payload
      analogData[index]*=alarmeComponentes[index].fator
      const cmdSql =` SELECT * FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
      // console.log(analogData[index]);
      // console.log(alarmeComponentes[index].device_modbus_read_id)
      // console.log(alarmeComponentes[index].device_modbus_read_reg)

      mysqlComp.query(cmdSql, function (err, result){
        if(err) {
          //console.log('Erro Create mySql log :'+err);
        }else {
          // console.log(analogData[index])
          // if(index==3){
          //   console.log('Valor: ',analogData[index])
          //   console.log('valorll: ',alarmeComponentes[index].bke_alarmes.valorll)
          //   console.log('valorl: ',alarmeComponentes[index].bke_alarmes.valorl)
          //   console.log('valorh: ',alarmeComponentes[index].bke_alarmes.valorh)
          //   console.log('valorhh: ',alarmeComponentes[index].bke_alarmes.valorhh)
   
          // }

          if(alarmeComponentes.length==0) return 

          if (result.length==0 && (analogData[index]<=alarmeComponentes[index].bke_alarmes.valorll) && (alarmeComponentes[index].bke_alarmes.habilitall)) {
            cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.textoll}', '${analogData[index]}','${alarmeComponentes[index].descricao}','${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadell}')`
            verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.textoll}`)
            //console.log(cmdSqlt);
            mysqlComp.query(cmdSqlt, function (err, result){
              //insertHistAlms(alarmeComponentes[index].id)
              //console.log('result->',result);
              //console.log('result->',err);
            })
          }

          if (result.length==0 && (analogData[index]<=alarmeComponentes[index].bke_alarmes.valorl) && (analogData[index]>alarmeComponentes[index].bke_alarmes.valorll || !alarmeComponentes[index].bke_alarmes.habilitall) && (alarmeComponentes[index].bke_alarmes.habilital)) {
            cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.textol}', '${analogData[index]}','${alarmeComponentes[index].descricao}','${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadel}')`
            verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.textol}`)
            //console.log(cmdSqlt);
            mysqlComp.query(cmdSqlt, function (err, result){
              //insertHistAlms(alarmeComponentes[index].id)
              //console.log('result->',result);
              //console.log('result->',err);
            })
          }

          if (result.length==0 && (analogData[index]>=alarmeComponentes[index].bke_alarmes.valorh) && (analogData[index]<alarmeComponentes[index].bke_alarmes.valorhh || !alarmeComponentes[index].bke_alarmes.habilitahh) && (alarmeComponentes[index].bke_alarmes.habilitah)) {
            cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.textoh}', '${analogData[index]}','${alarmeComponentes[index].descricao}','${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadeh}')`
            //console.log('email no alto')
            verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.textoh}`)
            //console.log(cmdSqlt);
            mysqlComp.query(cmdSqlt, function (err, result){
              //insertHistAlms(alarmeComponentes[index].id)
              //console.log('result->',result);
              //console.log('result->',err);
            })
          }

          if (result.length==0 && (analogData[index]>=alarmeComponentes[index].bke_alarmes.valorhh) && (alarmeComponentes[index].bke_alarmes.habilitahh)) {
            cmdSqlt =   ` INSERT INTO alarmes (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, navegacao, prioridade) VALUES ('${alarmeComponentes[index].id}','7','${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${alarmeComponentes[index].bke_alarmes.textohh}', '${analogData[index]}','${alarmeComponentes[index].descricao}','${alarmeComponentes[index].navegacao}','${alarmeComponentes[index].bke_alarmes.prioridadehh}')`
            //console.log('email no muito alto')
            verifyAddEmail(alarmeComponentes[index], ` Data e hora: ${moment().utc(-3).format('DD/MM/YYYY HH:mm:ss')} \n Equipamento: ${alarmeComponentes[index].descricao} \n Mensagem: ${alarmeComponentes[index].bke_alarmes.textohh}`)
            //console.log(cmdSqlt);
            mysqlComp.query(cmdSqlt, function (err, result){
              //insertHistAlms(alarmeComponentes[index].id)
              //console.log('result->',result);
              //console.log('result->',err);
            })
          }

          if(result.length>0){
            //console.log('result length: ',result.length)

            if ((analogData[index]<=alarmeComponentes[index].bke_alarmes.valorll) && (alarmeComponentes[index].bke_alarmes.habilitall)) {
              cmdSqlt = `UPDATE alarmes SET valor='${analogData[index]}' ,descricao='${alarmeComponentes[index].bke_alarmes.textoll}', prioridade='${alarmeComponentes[index].bke_alarmes.prioridadell}' WHERE id_componente='${alarmeComponentes[index].id}'`
              //console.log(cmdSqlt)
              mysqlComp.query(cmdSqlt, function (err, result){})
            }

            else if ((analogData[index]<=alarmeComponentes[index].bke_alarmes.valorl) && (analogData[index]>alarmeComponentes[index].bke_alarmes.valorll || !alarmeComponentes[index].bke_alarmes.habilitall) && (alarmeComponentes[index].bke_alarmes.habilital)) {
              cmdSqlt = `UPDATE alarmes SET valor='${analogData[index]}', descricao='${alarmeComponentes[index].bke_alarmes.textol}', prioridade='${alarmeComponentes[index].bke_alarmes.prioridadel}' WHERE id_componente='${alarmeComponentes[index].id}'`
              //console.log(cmdSqlt);
              mysqlComp.query(cmdSqlt, function (err, result){})
            }

            else if ((analogData[index]>=alarmeComponentes[index].bke_alarmes.valorh) && (analogData[index]<alarmeComponentes[index].bke_alarmes.valorhh || !alarmeComponentes[index].bke_alarmes.habilitahh) && (alarmeComponentes[index].bke_alarmes.habilitah)) {
              cmdSqlt = `UPDATE alarmes SET valor='${analogData[index]}', descricao='${alarmeComponentes[index].bke_alarmes.textoh}', prioridade='${alarmeComponentes[index].bke_alarmes.prioridadeh}' WHERE id_componente='${alarmeComponentes[index].id}'`
              //console.log(cmdSqlt);
              mysqlComp.query(cmdSqlt, function (err, result){})
            }

            else if ((analogData[index]>=alarmeComponentes[index].bke_alarmes.valorhh) && (alarmeComponentes[index].bke_alarmes.habilitahh)) {
              cmdSqlt = `UPDATE alarmes SET valor='${analogData[index]}', descricao='${alarmeComponentes[index].bke_alarmes.textohh}',prioridade='${alarmeComponentes[index].bke_alarmes.prioridadehh}' WHERE id_componente='${alarmeComponentes[index].id}'`
             // console.log(cmdSqlt);
              mysqlComp.query(cmdSqlt, function (err, result){})
            }

            else {
              insertHistAlms(alarmeComponentes[index].id)
              cmdSqlt = `DELETE FROM alarmes WHERE id_componente='${alarmeComponentes[index].id}'`
              //console.log(cmdSqlt)
              mysqlComp.query(cmdSqlt, function (err, result){})
            }
          }
          //console.log('OK Create mySql log - ',result);
        }
      })
    }
  }

}

}

//============================================================================================
//Delete tabela de log do componente
//============================================================================================
function deleteAlms(id_componente){
  const cmdSql = `DELETE FROM alarmes WHERE id_componente='${id_componente}'`
  mysqlComp.query(cmdSql, function (err, result){
    if(err) {
      console.log('Erro Delete mySql log :'+err);
    }else {
      //console.log('OK Delete mySql alarme registros - '+id_componente);
    }
  })
}

//============================================================================================
//Coloca no historico quando alarme resolvido
//============================================================================================
function insertHistAlms(id_componente){
  const cmdSql =` SELECT * FROM alarmes WHERE id_componente='${id_componente}'`
  mysqlComp.query(cmdSql, function (err, result){
    if(err) {
      console.log('Erro Delete mySql log :'+err);
    }else {
      //console.log(`result->${result}`)
      if (result) {
        const cmdSql = `INSERT INTO alarmes_historico  (id_componente,id_sistema,data_ocorrido,descricao, valor, equipamento, usuario, prioridade, data_resolucao, navegacao)
        VALUES ('${result[0].id_componente}', '${result[0].id_sistema}', '${moment(result[0].data_ocorrido).utc(-3).format('YYYY-MM-DD HH:mm:ss')}',
        '${result[0].descricao}','${result[0].valor}','${result[0].equipamento}',
        '', '${result[0].prioridade}', '${moment().utc(-3).format('YYYY-MM-DD HH:mm:ss')}','${result[0].navegacao}')`
        mysqlComp.query(cmdSql, function (err, result){
          if(err) {
            console.log('Erro Delete mySql log :'+err);
          }else {
          //console.log('OK Delete mySql alarme registros - '+id_componente);
        }
      })
      }else{
        console.log('Erro nao inserção de historico de alarmes (insertHistAlms)')
      }
    }
  })
}

console.log('Task alarmes teste Module iniciado em :'+moment().utc(-3).format());

module.exports = {verifyCompAlarmes, deleteAlms, insertHistAlms}
