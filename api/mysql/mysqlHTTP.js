const mysqlComp = require('../../config/database')
const log = require('../tasks/log')
const alarmes = require('../tasks/alarmes')
const tasksTimer = require('../tasks/tasksTimerObj')
var bcrypt = require('bcrypt');
const plataforma = process.platform

var sequencia = 0;

//======================================================
//Query mysql API http
//======================================================
function queryMysql(req,res,next){
	var cmdSql = req.params.queryMysql

	if (req.method=='GET'){
		mysqlComp.query(cmdSql, function (err, result){
			if(err) {
				res.status(500).send(err)
			}else {
				res.status(200).send(result)
			}
		})
	}else {
		return res.status(200).send({valid: 'ok'})
	}
}

//======================================================
//Query mysql API http
//======================================================
function queryMysqlInsertPost(req,res,next){

	const tableName =  req.body.tableName
	var cmdSql = req.body.cmd

	if (req.method=='POST'){
		mysqlComp.query(cmdSql, function (err, result){
			if(err) {
				res.status(201).send(err)
			}else {
        			tasksTimer.updateTaskObjects()
					log.verifyCompLog()
        			alarmes.verifyCompAlarmes()
					if (tableName){
						log.deleteCompLog(tableName)
          				alarmes.deleteAlms(tableName.replace(/[^0-9]/g, ''))
					}
				res.status(201).send(result)
			}
		})
	}else {
		return res.status(200).send({valid: 'ok'})
	}
}
//======================================================
//Query mysql API http
//======================================================
function queryMysqlGetPost(req,res,next){

	var cmdSql = req.body.cmd

	if (req.method=='POST'){
		mysqlComp.query(cmdSql, function (err, result){
			if(err) {
				console.log(err)
				res.status(500).send(err)
			}else {
				res.status(201).send(result)
			}
		})
	}else {
		return res.status(200).send({valid: 'ok'})
	}
}

//======================================================
//Query mysql API http
//======================================================
function queryMysqlUpdatePostHash(req,res,next){

	var email = req.body.email
	var senha = req.body.senha
	var acesso = req.body.acesso
  var nome = req.body.nome
	var sistema = req.body.sistema


	if (req.method=='POST'){

		//var bcrypt = require('bcrypt');
		var saltRounds = 10;
		var localPassword = senha;
		var salt = bcrypt.genSaltSync(saltRounds);
		var hash = bcrypt.hashSync(localPassword, salt);

		const cmdSql=  `UPDATE usuarios SET nome='${nome}', password='${hash}', acesso='${acesso}', id_sistema='${sistema}' WHERE email = '${email}'`

		mysqlComp.query(cmdSql, function (err, result){
			if(err) {
				res.status(500).send(err)
			}else {
				res.status(201).send(result)
			}
		})
	}else {
		return res.status(200).send({method: 'ok'})
	}
}

//======================================================
//Query mysql new user com password hash
//======================================================
function queryMysqlNewUserHash(req,res,next){
	if (req.method=='POST'){
		var email = req.body.email
		var senha = req.body.senha
		var acesso = req.body.acesso
    var nome = req.body.nome
		var sistema = req.body.sistema

		var saltRounds = 10;
		var localPassword = senha;
		var salt = bcrypt.genSaltSync(saltRounds);
		var hash = bcrypt.hashSync(localPassword, salt);
		const cmdSql= `INSERT INTO usuarios (id_sistema, id, acesso, nome, profissao, matricula, foto_path, email, telefone, password )
										VALUES ('${sistema}', 0 ,'${acesso}', '${nome}', 'none', '0','user.jpg', '${email}', '(xx) xxxxx-xxxx', '${hash}')`
		mysqlComp.query(cmdSql, function (err, result){
			if(err) {
				res.status(500).send(err)
			}else {
				res.status(200).send(result)
			}
		})
	}else {
		return res.status(200).send({method: 'ok'})
	}
}

//======================================================
//Query mysql API http
//======================================================
function queryMysqlLog(req,res,next){

	var cmdSql = req.body.cmd
	if (req.method=='POST'){
		mysqlComp.query(cmdSql, function (err, result){
			if(err) {
				res.status(500).send(err)
			}else {
				res.status(200).send(result)
			}
		})
	}else {
		return res.status(200).send({method: 'ok'})
	}
}

module.exports = {queryMysql, queryMysqlInsertPost, queryMysqlUpdatePostHash, queryMysqlNewUserHash, queryMysqlGetPost, queryMysqlLog}
