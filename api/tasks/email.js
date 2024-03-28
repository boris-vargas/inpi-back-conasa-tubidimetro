const moment = require('moment')
var nodemailer = require('nodemailer');
const remote = require('../remote/remote')
const mysqlComp = require('../../config/database')
var bcrypt = require('bcrypt')
var internetAvailable = require("internet-available");
var emailList = []
var localPassword = ''
const filelocal = require('../../api/files/filesLocal')
const fs = require('fs')
//======================================================
//set configuração  de e-mail
//======================================================
const setConfigEmail = (req, res, next) => {
  if (req.method=='POST'){
    const jsonConfig =  req.body
    filelocal.writeToFile('emailConfig.json',JSON.stringify(jsonConfig))
    return res.status(201).send({valid: 'ok', status:'configuracoes salvas'})
  }else{
    return res.status(201).send({valid: 'ok'})
  }
}
//======================================================
//get configuração  de e-mail
//======================================================
const getConfigEmail = (req, res, next) => {
  if (req.method=='POST'){
    var fileConfigLoc= fs.readFileSync('emailConfig.json');
    var configLoc= JSON.parse(fileConfigLoc.toString()) 
    res.status(201).send(configLoc)
  }else{
    return res.status(201).send({valid: 'ok'})
  }
}
//======================================================
//Testa parametros de  e-mail
//======================================================
const testeConfigEmail = (req, res, next) => {
  if (req.method=='POST'){
    internetAvailable({timeout: 3000,retries: 5,host: '8.8.8.8'}).then(function(){
      const jsonConfig =  req.body.jsonConfig
      const emailTeste =  {
          from:jsonConfig.email.emailUsuario,
          to:jsonConfig.email.emailUsuario,
          subject: 'INPI-CPU-3B - E-mail para verificação de configuração',
          text: `E-mail enviado automaticamente pela plataforma inWeb. Se você recebeu este e-mail, seu controlador está configurado corretamente.

                O conteúdo deste e-mail e anexos, se existirem, são confidenciais ao destinatário pretendido. Se você não for o destinatário pretendido, por favor não use ou publique seu conteúdo. Entre em contato com o remetente imediatamente e, em seguida, exclua o e-mail. Os e-mails não são seguros e podem conter vírus. Nós não somos responsáveis por danos causados por vírus transmitidos por e-mail.

                The contents of this email and attachments, if any, are confidential to the intended addressee. If you are not the intended addressee please do not use or publish its contents,please contact the sender immediately and then delete the email. Emails are not secure and may contain viruses. We are not responsible for damages caused by viruses transmitted by email.

                `
      }
      var testeTransporter = nodemailer.createTransport({
        host: jsonConfig.email.emailServidor,
        port: jsonConfig.email.emailPorta,
        secure: jsonConfig.email.emailSeguro,
        connectionTimeout: 10000,
        auth: {
          user: jsonConfig.email.emailUsuario,
          pass: jsonConfig.email.emailSenha
        }
      });

      testeTransporter.sendMail(emailTeste, function(error, info){
        if(error){
          res.status(500).send({valid:'error'})
        }else{
          res.status(201).send({valid: 'ok', status:'configuracoes corretas'})
        }
      })
    }).catch(function(err) {
          console.log("E-mail log: Sem conexao com internet");
          res.status(500).send({valid:'error', status:'sem internet'})
        }); 
  }else{
    res.status(201).send({valid: 'ok'})
  }
}
//======================================================
//Le arquivo de e-mail
//======================================================
  var fileConfig= fs.readFileSync('emailConfig.json');
  var config = JSON.parse(fileConfig.toString()) 

//============================================================================================
//Cria tranporte SMTP solicitado
//============================================================================================
// var transporterSolicitado = nodemailer.createTransport({
//   host: "smtp.kinghost.net",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "plcpi-noreplay@intech-automacao.com.br",
//     pass: "Intech2007"
//   }
// });

var transporterSolicitado = nodemailer.createTransport({
  host: config.jsonConfig.email.emailServidor,
  port: config.jsonConfig.email.emailPorta,
  secure: config.jsonConfig.email.emailSeguro,
  auth: {
    user: config.jsonConfig.email.emailUsuario,
    pass: config.jsonConfig.email.emailSenha
  }
});
//============================================================================================
//Envia e-mail de senha solicitado
//============================================================================================
function sendEmailSenha(req,res,next){
  if (req.method=='POST'){
    var millis = moment().format('x')
    localPassword = millis;
    const emailListSolicitado =  {
      from:req.body.from,
      to:req.body.to,
      cc: req.body.cc,
      subject: req.body.subject,
      text: `Sua nova senha para acesso ao INPI-CPU-3B é: ${localPassword}`//req.body.body
    }
    var cmdSql = `SELECT * from usuarios WHERE email='${emailListSolicitado.to}' `
    mysqlComp.query(cmdSql, function (err, response){
      if(err) {
        console.log(err)
        res.status(500).send({status: 'Dados inválidos'})
      }else {
        if (response.length==1) {
         transporterSolicitado.sendMail(emailListSolicitado, function(error, info){
          if(error){
            res.status(500).send({status:'Erro no envio da mensagem', msg: error})
          }else{

            bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(localPassword, salt, function(errHash, hash) {
                if (errHash) {
                  console.log('Error',errHash)
                }else
                var cmdSql1=  `UPDATE usuarios SET password='${hash}' WHERE email = '${emailListSolicitado.to}'`
                console.log(cmdSql1)
                mysqlComp.query(cmdSql1, function (err1, result){
                  if(err1) {
                    console.log('erro no mysql password')
                    res.status(500).send(err1)
                  }else {
                    console.log('mysql password ok')

                    res.status(201).send({status:'Uma nova senha foi enviada para o e-mail solicitado!', msg: info})
                  }
                })
              })
            })
          }
        })
       }else{
        res.status(500).send({status: 'Usuário não cadastrado!'})
      }
    }
  })
  }else{
    return res.status(200).send({valid: 'ok'})
  }
}
setTimeout(function(){
  //============================================================================================
  //Cria tranporte SMTP -  Alarmes
  //============================================================================================
var transporter = nodemailer.createTransport({
  host: config.jsonConfig.email.emailServidor,
  port: config.jsonConfig.email.emailPorta,
  secure: config.jsonConfig.email.emailSeguro,
  auth: {
    user: config.jsonConfig.email.emailUsuario,
    pass: config.jsonConfig.email.emailSenha
  }
});
  //============================================================================================
  //Verifica se existe algum email pendente de envio.
  //============================================================================================
  setInterval(function(){
    if (emailList.length>0){
      internetAvailable({
        timeout: 3000, 
        retries: 5,
        host: '8.8.8.8'
      }).then(() => {
        for (var i = emailList.length - 1; i >= 0; i--) {
          transporter.sendMail(emailList[i], function(err, info){
            if(err){
              console.log(`erro->${i}`,err);
              emailList.pop()
            }else{
              console.log(`Mensagem enviada->${i}`,info);
              emailList.pop()
            }
          })
        }
      }).catch(() => {
          //console.log("E-mail log: Sem conexao com internet");
        });  

    } 

  },5000)
  console.log('Task e-mail Module iniciado em :'+moment().utcOffset(-180).format());
},10000)
//============================================================================================
//Envia e-mail
//============================================================================================
function sendEmail(obejtoEmail){
  return transporter.sendMail(obejtoEmail, function(err, info){
    if(err){
      console.log(err);
    }else{
      console.log("Mensagem enviada com sucesso");
    }
  })
}
const copyrigth =
`
O conteúdo deste e-mail e anexos, se existirem, são confidenciais ao destinatário pretendido. Se você não for o destinatário pretendido, por favor não use ou publique seu conteúdo. Entre em contato com o remetente imediatamente e, em seguida, exclua o e-mail. Os e-mails não são seguros e podem conter vírus. Nós não somos responsáveis por danos causados por vírus transmitidos por e-mail.

The contents of this email and attachments, if any, are confidential to the intended addressee. If you are not the intended addressee please do not use or publish its contents,please contact the sender immediately and then delete the email. Emails are not secure and may contain viruses. We are not responsible for damages caused by viruses transmitted by email.

`
//============================================================================================
//Coloca email na fila
//============================================================================================
function addEmailAlm(to,text){
  emailList.push({
    from:`"${config.jsonConfig.email.emailNome}" <${config.jsonConfig.email.emailUsuario}>`,
    to:to,
    subject: config.jsonConfig.email.emailAssunto,
    text: ` Mensagem de alarme gerada automaticamente pela plataforma INPI CPU:\n\n${text}\n\nIP público: ${remote.remoteInfosEquipamentRead().objeto?remote.remoteInfosEquipamentRead().objeto.ipv4:''}\n\nAcesse www.intech-automacao.com.br e fique por dentro das últimas novidades \n\n${copyrigth}  `
  })
}





module.exports = {emailList,addEmailAlm,sendEmailSenha, setConfigEmail, testeConfigEmail, getConfigEmail}
