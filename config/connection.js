var mysql = require('mysql');

var con = mysql.createConnection({
  host: 'localhost',
  port: "3306",
  user: 'root',
  password: '',
  database:  "zktor_fandlDb",
  multipleStatements: true,
  debug: false,
 //timezone:'GMT+3',
  connectionLimit: 30,
  queueLimit: 45,
  connectTimeout: 1000000,
  acquireTimeout: 1000000,
   charset : 'utf8mb4'
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = con;