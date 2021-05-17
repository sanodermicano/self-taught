require("dotenv").config();
const mysql = require('mysql');

//root '' for xampp
class MySQL {
    constructor(){ }

    // util = mysql.createConnection({
    util = mysql.createPool({
        // connectionLimit: 5,
        database: process.env.DATABASE,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT,
        host: process.env.DATABASE_HOST
    });
}

module.exports.mySQL = new MySQL();