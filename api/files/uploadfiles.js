const fs = require('fs');
var multer = require('multer');
const mysqlComp = require('../../config/database')
const execCommandSudo = require('../mysql/mysqlBackApp')
const path = require('path');


var storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    //cb(null, 'C:/Users/boris/Dropbox/000 - Pessoal/000 - Boris/000 - Projetos/099 - in-Tech/002 - Telemetria IoT/000 - inWeb/front-v2.1/public/assets/imgs/general')
    cb(null, '/var/www/html/assets/imgs/general')
   },
  filename: function (req, file, cb) {
    //console.log(file)
    //var datetimestamp = Date.now();
    //cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    cb(null, file.originalname)
  }
});

var storage1 = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
   //cb(null, 'C:/Users/boris/Dropbox/000 - Pessoal/000 - Boris/000 - Projetos/099 - in-Tech/002 - Telemetria IoT/000 - inWeb/front-v2.1/public/assets/imgs/objects')
   cb(null, '/var/www/html/assets/imgs/objects')
  },
  filename: function (req, file, cb) {
    //console.log(file)
    //var datetimestamp = Date.now();
    //cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    cb(null, file.originalname)
  }
});  

//======================================================
//Recebe arquivo de banco para importar
//======================================================
var storage2 = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
   cb(null, path.join(__dirname, '..', '..', '/'))
  },
  filename: function (req, file, cb) {
    cb(null, 'upload.sql') 
  }
});  
//======================================================
//Recebe arquivo de node-red para importar
//======================================================
var storage3 = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
   cb(null, '/home/pi/.node-red/')
  },
  filename: function (req, file, cb) {
    cb(null, 'flows_INPI-CPU-3B.json') 
  }
}); 

    var upload = multer({ //multer settings
      storage: storage
    }).single('file');

    var upload1 = multer({ //multer settings
      storage: storage1
    }).single('file');

    var upload2 = multer({ //multer settings
      storage: storage2
    }).single('file');    

    var upload3 = multer({ //multer settings
      storage: storage3
    }).single('file');    
//======================================================
//lista imagens
//======================================================
function getImageList(req,res,next){
  var path = req.body.path
  var filter = req.body.filter
  var filesget = []
  //filesget.id = []
  if (req.method=='POST'){
    var files = fs.readdirSync(path)
    files.forEach(file => {
      if (filter=='png-jpg-gif') {
        if (file.indexOf('png')>0 || file.indexOf('jpg')>0  || file.indexOf('gif')>0) {
          filesget.push({file:file})
        }
      }else{
        if (file.indexOf(filter)>0) {
          filesget.push({file:file})
        }
      }
    })

    return res.status(200).send({files: filesget})

  }else {
    return res.status(200).send({valid: 'ok'})
  }
}

//======================================================
//upload image to server pasta tema
//======================================================
function uploadImageGeneral(req,res,next){
  if (req.method=='POST'){
    upload(req,res,function(err){
      if(err){
        return res.status(200).send({error_code:1, error: err})
      }else{
        return res.status(200).send({error_code:0,err_desc:null})
      }
    })   
  }else {
    return res.status(200).send({status: 'next'})
  }
}

//======================================================
//upload image to server pasta buttons
//======================================================
function uploadImageObject(req,res,next){
  if (req.method=='POST'){
   upload1(req,res,function(err){
    if(err){
      return res.status(200).send({error_code:1, error: err})
    }else{
      return res.status(200).send({error_code:0,err_desc:null})
    }
  })   

 }else {
  return res.status(200).send({status: 'next'})
}
}
//======================================================
//upload arquivo de backup mysql
//======================================================
function uploadArquivoImportMysql(req,res,next){
  if (req.method=='POST'){
   upload2(req,res,function(err){
    if(err){
      return res.status(200).send({error_code:1, error: err})
    }else{
      restauraBackupMysql(res)
    }
  })   
 }else {
  return res.status(200).send({status: 'next'})
 }
}

function restauraBackupMysql(res){
  var filename = "upload.sql";
  var filePath = path.join(__dirname, '..', '..', '/', filename);
  var cmdSql = `DROP DATABASE iot;`
  mysqlComp.query(cmdSql, function (err, result){
      if(err) {
        console.log('erro no drop')
      }else {
        cmdSql = `CREATE DATABASE iot;`
        mysqlComp.query(cmdSql, function (err, result){
          if(err) {
            console.log('erro no create')
          }else {
            if(execCommandSudo.execFunctionCmdLine(`sudo mysql iot< ${filePath}`)){
              console.log('ok restaurado')
              try {
                fs.unlinkSync(filePath)
              } catch(err) {
                console.log(err)
              }
              res.status(200).send({error_code:0,err_desc:null})
            }else{
              console.log('erro no restore')
              res.status(200).send({error_code:1, error: err})
            }

          }
        })





      }
    })
}



//======================================================
//upload arquivo de backup node-red
//======================================================
function uploadArquivoImportNodeRed(req,res,next){
  if (req.method=='POST'){
   upload3(req,res,function(err){
    if(err){
      return res.status(200).send({error_code:1, error: err})
    }else{
      return res.status(200).send({error_code:0,err_desc:null})
    }
  })   
 }else {
  return res.status(200).send({status: 'next'})
 }
}
//======================================================
//delete file
//======================================================
function deleteFileGeral(req,res,next){
  if (req.method=='POST'){
  try {
    fs.unlinkSync(`/var/www/html/assets/imgs/general/${req.body.file}`)
     res.status(200).send({status: 'ok'})
  } catch(err) {
    console.log(err)
    res.status(500).send({status: 'erro na exclusão do arquivo'})
  }
 }else {
    return res.status(200).send({status: 'next'})
  }
}

//======================================================
//delete file
//======================================================
function deleteFileObjetos(req,res,next){
  if (req.method=='POST'){
  try {
    fs.unlinkSync(`/var/www/html/assets/imgs/objects/${req.body.file}`)
     console.log('removido')
     res.status(200).send({status: 'ok'})
  } catch(err) {
    console.log(err)
    res.status(500).send({status: 'erro na exclusão do arquivo'})
  }


   
  }else {
    return res.status(200).send({status: 'next'})
  }
}


module.exports = {getImageList, uploadImageGeneral,uploadImageObject, deleteFileGeral, deleteFileObjetos, uploadArquivoImportMysql, uploadArquivoImportNodeRed}
