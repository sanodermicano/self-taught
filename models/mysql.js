const mysql = require('mysql');
require("dotenv").config();

//root '' for xampp
exports.util = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWRD,
    database: process.env.DATABASE
});