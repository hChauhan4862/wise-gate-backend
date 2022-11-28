const mysql = require('mysql');
const util = require('util');


var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user:'wiseneoscogates',
    password:'WiseNeosco@135',
    database:"wiseneoscogates",
    multipleStatements: true
});

mysqlConnection.connect((error)=>{
    if(!error){
        console.log("DB connection succeded");
    }else{
        console.log("DB connection failed \n Error : " + JSON.stringify(error, undefined, 2))
    }
})

const sqlQuery = util.promisify(mysqlConnection.query).bind(mysqlConnection);


module.exports={
    mysqlConnection,
    sqlQuery
}