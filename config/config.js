const dotenv = require('dotenv').config().parsed;

let config = {
  username: dotenv.MYSQL_USERNAME,
  password: dotenv.MYSQL_PASSWORD,
  database: dotenv.MYSQL_DATABASE,
  host: dotenv.MYSQL_HOST,
  port: dotenv.MYSQL_PORT,
  dialect: 'mysql',
};

module.exports = {
  development: config,
  test: config,
  production: config,
};

/*
{
  "development": {
    "username": "root",
    "password": "",
    "database": "teste",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": "",
    "database": "teste",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": "",
    "database": "teste",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
*/
