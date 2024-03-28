const _ = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
//const User = require('./user')
const env = require('../../.env')
const emailRegex = /\S+@\S+\.\S+/
const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,12})/
const mysql = require('../../config/database')

//======================================================
//verifica login
//======================================================
const login = (req, res, next) => {
	const email = req.body.email || ''
	const password = req.body.password || ''

	const saltRounds = 10;	
	mysql.query(`SELECT * FROM usuarios WHERE email='${email}'`, function (err, result){ //email
	var hashReq = bcrypt.hashSync(password, saltRounds);
		if(err) {
			console.log("passei no erro",err)
			return res.json({result, err})
		}else if (result[0] && bcrypt.compareSync(password, result[0].password)) {
			console.log("vou comparar")
			console.log(typeof result)
			var payload = {payload:result[0]}
			console.log(payload)
			console.log(env.authSecret)
			const token = jwt.sign(JSON.stringify(result[0]), env.authSecret, {
				//expiresIn: "30 days"
				//expiresIn: "10 seconds"
			})
			console.log("depois do jwt")
			console.log(token)

			//console.log(result[0]);
			const { id_sistema, acesso, nome, matricula, foto_path, email, telefone, password } = result[0]
			console.log('Login OK backend',nome, email)
			res.json({ id_sistema, acesso, nome, matricula, foto_path, email, telefone, password, token })
		}else {
			return res.status(400).send({errors: ['Usuário/Senha inválidos']})
		}
	})
}
//======================================================
//valida Token
//======================================================
const validateToken = (req, res, next) => {
	const token = req.body.token || ''
	jwt.verify(token, env.authSecret, function(err, decoded) {
		return res.status(200).send({valid: !err})
	})
}
//======================================================
//Valida signup
//======================================================
const signup = (req, res, next) => {
	const name = req.body.name || ''
	const email = req.body.email || ''
	const password = req.body.password || ''
	const confirmPassword = req.body.confirm_password || ''

	if(!email.match(emailRegex)) {
		return res.status(400).send({errors: ['O e-mail informado está inválido']})
	}
	if(!password.match(passwordRegex)) {
		return res.status(400).send({errors: ["Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$%) e tamanho entre 6-12."
	]})
}
const salt = bcrypt.genSaltSync()
const passwordHash = bcrypt.hashSync(password, salt)

if(!bcrypt.compareSync(confirmPassword, passwordHash)) {
	return res.status(400).send({errors: ['Senhas não conferem.']})
}

mysql.query("SELECT * FROM usuarios WHERE email='"+email+"'", function (err, result){
	if (result.length>0) {
		console.log('email ja cadastrado');
		return res.status(400).send({errors: ['Usuário já cadastrado.']})
	}
	const cmdSql= `INSERT INTO usuarios (
		id_sistema, acesso,nome,matricula, foto_path, email, telefone, password )
		VALUES ('7','3','${name}','99999','user.jpg','${email}','96028505','${passwordHash}')
		`
		mysql.query(cmdSql, function (err, result){
			if (err) {return res.status(400).send({result: ['Erro na inserção do novo usuário']})}
			login(req, res, next)
			//return res.status(200).send({result: ['Novo usuário cadastrado']})

		})


	})

}

module.exports = {login, signup, validateToken}
