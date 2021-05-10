require("dotenv").config();
const mysql = require('mysql');

//root '' for xampp
class MySQL {
    constructor(){ }

    util = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWRD,
        database: process.env.DATABASE
    });
}

module.exports.mySQL = new MySQL();