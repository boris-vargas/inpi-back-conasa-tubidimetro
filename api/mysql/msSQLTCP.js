const ab2str = require('arraybuffer-to-string')
const mssql = require('mssql')

//======================================================
//Query mysql Driver TCP
//======================================================


//Server=localhost\SQLEXPRESS;Database=master;Trusted_Connection=True;
//const connStr = String.raw`Server=INTECHNOTE20\TESTEDATABASE;Database=master;

const connStr = "Server=INTECHNOTE20\\TESTEDATABASE;Database=TESTEDATABASE;User Id=INTECHNOTE20\\boris;Password=;";
// var config = {
//     server: `INTECHNOTE20\\TESTEDATABASE`,
//     database: "TESTEDATABASE",
//     user: "boris"};
console.log(connStr);
mssql.connect(connStr)
   .then(conn => console.log("conectou!"))
   .catch(err => console.log("erro! " + err))

   //fazendo a conexão global
   // mssql.connect(connStr)
   //    .then(conn => GLOBAL.conn = conn)
   //    .catch(err => console.log(err));
   //
   //    //
      // const table = new mssql.Table('Clientes');
      //  table.create = true;
      //  table.columns.add('ID', mssql.Int, {nullable: false, primary: true});
      //  table.columns.add('Nome', mssql.NVarCh'serviar(150), {nullable: false});
      //  table.columns.add('CPF', mssql.NChar(11), {nullable: false});
      //  table.rows.add(1, 'teste1', '12345678901');
      //  table.rows.add(2, 'teste2', '09876543210');
      //  table.rows.add(3, 'teste3', '12312312399');
      //
      //  const request = new mssql.Request()
      //  request.bulk(table)
      //         .then(result => console.log('funcionou'))
      //         .catch(err => console.log('erro no bulk. ' + err));


function msSQLTCP(){
  const porta = 5011
  //Carrga library TCP
  net = require('net');
  // Start o Servidor TCP
  net.createServer(function (socket) {
    //Evento na recepção dos dados TCP
    socket.on('data', function (data) {
      dataStringReceived = ab2str(data);
      mysql.query(dataStringReceived, function (err, result){
        if(err) {
            socket.write("SQL Response: " + JSON.stringify(err))
          }else {
            socket.write("SQL Response: " + JSON.stringify(result))
          }
      })
    });
    // Socket close
    socket.on('end', function () {
      //Evento na desconexão TCP
    });
  }).listen(porta);
  // Put a friendly message on the terminal of the server.
  console.log("Driver TCP msSQL rodando na porta: ",porta);
}
module.exports = {msSQLTCP}
