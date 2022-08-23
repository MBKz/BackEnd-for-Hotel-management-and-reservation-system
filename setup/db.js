const { Sequelize } = require("sequelize");
const config = require("config");
const winston = require('winston');


const db = new Sequelize(
  config.get("db.database"),
  config.get("db.username"),
  config.get("db.password"),
  {
    host: config.get("db.host"),
    dialect: config.get("db.dialect"),
  }
);

db.authenticate()
.then(() => winston.info('Connected successfully ...'))
// should be removed later
.catch((err) => console.log("Error: " + err));

module.exports = db;
