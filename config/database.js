const mysql = require('mysql')
const plataforma = process.platform
var cmdSql

var MYSQL_HOST = '127.0.0.1';
var MYSQL_USER = 'pi';
var MYSQL_PASSWORD = 'intech2018';
var MYSQL_DATABASE = 'iot';

//---------------------------------------
//mysql hosting - setup para linux (PLCpi)
//---------------------------------------
// if (plataforma!='linux') {
//   MYSQL_HOST = 'localhost';
//   MYSQL_USER = 'root';
//   MYSQL_PASSWORD = '';
//   MYSQL_DATABASE = 'iot';
// }
//---------------------------------------
//MYSQL cria conexão com o banco
//---------------------------------------
var conMysql = mysql.createConnection({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE
});
//---------------------------------------
//MYSQL verifica se existe a tabela de sistemas
//senão cria.
//---------------------------------------
cmdSql = `
CREATE TABLE IF NOT EXISTS  \`iot\`.\`config_sistema\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`nome\` varchar(100) COLLATE latin1_spanish_ci NOT NULL,
  \`tempo_update_comp\` int(10) unsigned NOT NULL,
  \`menu1_nome\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu1_icon\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu1_visible\` tinyint(1) DEFAULT NULL,
  \`menu2_nome\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu2_icon\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu2_visible\` tinyint(1) DEFAULT NULL,
  \`menu3_nome\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu3_icon\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu3_visible\` tinyint(1) DEFAULT NULL,
  \`menu4_nome\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu4_icon\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu4_visible\` tinyint(1) DEFAULT NULL,
  \`menu5_nome\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu5_icon\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu5_visible\` tinyint(1) DEFAULT NULL,
  \`menu6_nome\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu6_icon\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu6_visible\` tinyint(1) DEFAULT NULL,
  \`menu7_nome\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu7_icon\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu7_visible\` tinyint(1) DEFAULT NULL,
  \`menu8_nome\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu8_icon\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu8_visible\` tinyint(1) DEFAULT NULL,
  \`menu9_nome\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu9_icon\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu9_visible\` tinyint(1) DEFAULT NULL,
  \`menu10_nome\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu10_icon\` varchar(45) COLLATE latin1_spanish_ci DEFAULT ' ',
  \`menu10_visible\` tinyint(1) DEFAULT NULL,
  \`nome_fontsize\` int(2) unsigned DEFAULT NULL,
  \`barra_avisos_visualizar\` tinyint(1) DEFAULT NULL,
  \`path_imagem_cliente\` varchar(99) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`update_charts\` int(10) unsigned DEFAULT NULL,
  \`baudrate_inpiplc\` int(10) unsigned DEFAULT NULL,
  \`timeout_inpiplc\` int(10) unsigned DEFAULT NULL,
  \`enableAudioAlm\` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;
`




conMysql.query(cmdSql, function (err, result){
  if(err) {
    console.log('Erro Create mySql sistema');
  }else {
    console.log('OK Create mySql sistema');
    cmdSql= "INSERT INTO config_sistema ("+
        "id, "+
        "nome, "+
        "tempo_update_comp, "+
        "update_charts, "+
        "baudrate_inpiplc, "+
        "timeout_inpiplc, "+
        "path_imagem_cliente"+
        ") "+
        "VALUES ("+
          7 +",'"+
          'in-Tech ioT' +"',"+
          5 +","+
          60 +","+
          115200 +","+
          100 +",'"+
          'iot.png'+"')"

        conMysql.query(cmdSql, function (err, result){
          if(err) {
            console.log('Erro Create sistema');
          }else {
            console.log('OK Create sistemas');
          }
        })
  }
})

//---------------------------------------
//MYSQL verifica se existe a tabela de componentes
//senão cria.
//---------------------------------------
cmdSql = `
CREATE TABLE IF NOT EXISTS  \`iot\`.\`config_compontes\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`id_sistema\` int(10) unsigned NOT NULL,
  \`descricao\` varchar(45) CHARACTER SET latin1 NOT NULL,
  \`device_modbus_write_id\` int(10) unsigned DEFAULT '0',
  \`device_modbus_write_reg\` int(10) unsigned DEFAULT '0',
  \`device_modbus_write_id_1\` int(10) unsigned DEFAULT '0',
  \`device_modbus_write_reg_1\` int(10) unsigned DEFAULT '0',
  \`device_modbus_write_id_2\` int(10) unsigned DEFAULT '0',
  \`device_modbus_write_reg_2\` int(10) unsigned DEFAULT '0',
  \`device_modbus_read_id\` int(10) unsigned DEFAULT '0',
  \`device_modbus_read_reg\` varchar(45) CHARACTER SET latin1 DEFAULT '0',
  \`tipo\` varchar(45) CHARACTER SET latin1 NOT NULL,
  \`modulo_plcpi\` varchar(45) CHARACTER SET latin1 DEFAULT NULL,
  \`unidade_medida\` varchar(45) CHARACTER SET latin1 DEFAULT NULL,
  \`menu_navegacao\` varchar(45) CHARACTER SET latin1 NOT NULL,
  \`nivel_min\` varchar(10) CHARACTER SET latin1 DEFAULT NULL,
  \`nivel_max\` varchar(10) CHARACTER SET latin1 DEFAULT NULL,
  \`nivel_alto\` varchar(10) CHARACTER SET latin1 DEFAULT NULL,
  \`nivel_baixo\` varchar(10) CHARACTER SET latin1 DEFAULT NULL,
  \`fator\` decimal(5,3) DEFAULT NULL,
  \`bke_tasks\` text COLLATE latin1_spanish_ci,
  \`log\` tinyint(1) DEFAULT NULL,
  \`log_tempo\` int(10) unsigned DEFAULT NULL,
  \`sequencia\` int(10) unsigned DEFAULT NULL,
  \`visivel\` varchar(1) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`bke_alarmes\` text COLLATE latin1_spanish_ci,
  \`icoon\` varchar(255) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`icooff\` varchar(255) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`imagesize\` varchar(4) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`imagetop\` varchar(4) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`parameters\` text COLLATE latin1_spanish_ci,
  \`unidade_medida_temp\` varchar(45) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`ultimo_valor\` int(10) unsigned DEFAULT NULL,
  \`cor_normal\` varchar(7) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`cor_baixo\` varchar(7) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`cor_alto\` varchar(7) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`tamanho\` varchar(45) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`nome_tabela_log\` varchar(100) COLLATE latin1_spanish_ci DEFAULT NULL,
  \`font_size\` varchar(100) COLLATE latin1_spanish_ci DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

`


conMysql.query(cmdSql, function (err, result){
  if(err) {
    console.log('Erro Create mySql componentes');
  }else {
    console.log('OK Create mySql componentes');
  }
})
//---------------------------------------
//MYSQL verifica se existe a tabela de alarmes
//senão cria.
//---------------------------------------
cmdSql = `

CREATE TABLE IF NOT EXISTS \`iot\`.\`alarmes\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`id_componente\` int(10) unsigned NOT NULL,
  \`id_sistema\` varchar(45) NOT NULL,
  \`data_ocorrido\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`descricao\` varchar(45) NOT NULL,
  \`valor\` decimal(9,2) unsigned NOT NULL,
  \`equipamento\` varchar(45) NOT NULL,
  \`prioridade\` int(10) unsigned DEFAULT NULL,
  \`navegacao\` varchar(45) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=377 DEFAULT CHARSET=latin1;

`
conMysql.query(cmdSql, function (err, result){
  if(err) {
    console.log('Erro Create mySql alarmes');
  }else {
    console.log('OK Create mySql alarmes');
  }
})
//---------------------------------------
//MYSQL verifica se existe a tabela de alarmes historicos
//senão cria.
//---------------------------------------
cmdSql = `
CREATE TABLE IF NOT EXISTS \`iot\`.\`alarmes_historico\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`id_componente\` int(10) unsigned NOT NULL,
  \`id_sistema\` varchar(45) NOT NULL,
  \`data_ocorrido\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`descricao\` varchar(45) NOT NULL,
  \`valor\` decimal(9,2) unsigned NOT NULL,
  \`equipamento\` varchar(45) NOT NULL,
  \`prioridade\` int(10) unsigned DEFAULT NULL,
  \`usuario\` varchar(45) DEFAULT NULL,
  \`data_resolucao\` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  \`navegacao\` varchar(45) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=289 DEFAULT CHARSET=latin1;
`
conMysql.query(cmdSql, function (err, result){
  if(err) {
    console.log('Erro Create mySql alarmes historicos', err);
  }else {
    console.log('OK Create mySql alarmes historicos');
  }
})
//---------------------------------------
//MYSQL verifica se existe a tabela de avisos
//senão cria.
//---------------------------------------
cmdSql = `
CREATE TABLE IF NOT EXISTS \`iot\`.\`avisos\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`id_componente\` int(10) unsigned NOT NULL,
  \`descricao\` varchar(45) NOT NULL,
  \`estado\` varchar(45) DEFAULT NULL,
  \`reg\` int(10) unsigned NOT NULL,
  \`endereco\` varchar(45) NOT NULL,
  \`tipo_var\` varchar(45) NOT NULL,
  \`extract_bits\` varchar(45) NOT NULL,
  \`bit_num\` int(10) unsigned NOT NULL,
  \`usuario\` varchar(45) NOT NULL,
  \`datahora_ocorrido\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`datahora_reconhecimento\` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  \`data_hora_resolvido\` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  \`nome_componente\` varchar(45) NOT NULL,
  \`prioridade\` int(10) unsigned NOT NULL,
  \`id_sistema\` int(10) unsigned NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
`
conMysql.query(cmdSql, function (err, result){
  if(err) {
    console.log('Erro Create mySql Avisos');
  }else {
    console.log('OK Create mySql Avisos');
  }
})


//---------------------------------------
//MYSQL verifica se existe a tabela de usuarios
//senão cria.
//---------------------------------------
cmdSql = `
CREATE TABLE IF NOT EXISTS  \`iot\`.\`usuarios\` (
  \`id\` int(10) unsigned DEFAULT '0',
  \`id_sistema\` int(10) unsigned NOT NULL,
  \`acesso\` int(10) unsigned DEFAULT NULL COMMENT '0 adm master - 1 adm 2 operador 3 visitante',
  \`nome\` varchar(45) NOT NULL,
  \`profissao\` varchar(45) DEFAULT NULL,
  \`matricula\` varchar(45) DEFAULT NULL,
  \`foto_path\` text,
  \`email\` varchar(100) NOT NULL,
  \`telefone\` varchar(45) DEFAULT NULL,
  \`password\` text NOT NULL,
  PRIMARY KEY (\`email\`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`


conMysql.query(cmdSql, function (err, result){
  if(err) {
    console.log('Erro Create mySql usuários');
  }else {
    console.log('OK Create mySql usuários');

    var bcrypt = require('bcrypt');
    var saltRounds = 10;
    var localPassword = 'intech2018';
    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(localPassword, salt);

    var localPassword1 = 'intech';
    salt = bcrypt.genSaltSync(saltRounds);
    var hash1 = bcrypt.hashSync(localPassword1, salt);

    var localPassword2 = 'convidado';
    salt = bcrypt.genSaltSync(saltRounds);
    var hash2 = bcrypt.hashSync(localPassword2, salt);


    cmdSql= "INSERT INTO usuarios ("+
    "id_sistema, "+
    "acesso, "+
    "nome, "+
    "profissao, "+
    "matricula, "+
    "foto_path, "+
    "email, "+
    "telefone, "+
    "password "+

    ") "+
    "VALUES ("+
      7 +","+
      0 +",'"+
      'Desenvolvimento' +"','"+
      'Master dev.' +"','"+
      1 +"','"+
      'user.jpg' +"','"+
      'dev@intech-automacao.com.br' +"','"+
      '(41) 9 9602-8505' +"','"+
       hash +"'),"+

       "("+
         7 +","+
         0 +",'"+
         'in-Tech Master' +"','"+
         'Master' +"','"+
         1 +"','"+
         'user.jpg' +"','"+
         'intech@intech-automacao.com.br' +"','"+
         '(41) 3072-0326' +"','"+
          hash1 +"'), "+

          "("+
            7 +","+
            3 +",'"+
            'in-Tech Convidado' +"','"+
            'Convidado' +"','"+
            1 +"','"+
            'user.jpg' +"','"+
            'convidado@intech-automacao.com.br' +"','"+
            '(41) 3072-0326' +"','"+
             hash2 +"')"

    conMysql.query(cmdSql, function (err, result){
      if(err) {
        console.log('Erro Create hash admin');
      }else {
        console.log('OK Create hash admin');
      }
    })

  }
})

cmdSql = `SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))`
conMysql.query(cmdSql, function (err, result){
  if(err) {
    console.log('Erro SET GLOBAL');
  }else {
    console.log('OK SET GLOBAL');
  }
})

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Insere campos criados em vensores posteriores
//Adiciona campo de habilita som no alarme
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
cmdSql = `ALTER TABLE config_sistema 
ADD enableAudioAlm tinyint(1),
ADD timeout_inpiplc int(10);
`
conMysql.query(cmdSql, function (err, result){
  if(err) {
    console.log('Erro/exist ADD changes version');
  }else {
    console.log('OK CREATED enableAudioAlm on config_sistema');
  }
})

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Insere campos criados em vensores posteriores
//Adiciona campo de habilita gravação de  log por mudança de estado
//mudanca_estado
//banda_morta
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
cmdSql = `ALTER TABLE config_compontes 
ADD mudanca_estado tinyint(1),
ADD banda_morta decimal(5,3);
`
conMysql.query(cmdSql, function (err, result){
  if(err) {
    console.log('Erro/exist ADD changes version');
  }else {
    console.log('OK CREATED ADD changes version');
  }
})



console.log(`Driver mysql direcionada para : ${MYSQL_HOST}`)
console.log(`Driver mysql Database : ${MYSQL_DATABASE}`)
console.log(`Driver mysql Database User : ${MYSQL_USER}`)

module.exports = conMysql
