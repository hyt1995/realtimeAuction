require('dotenv').config();



module.exports = {
  development: {
    username: 'root',
    password: process.env.AUCTION,
    database: 'auctionDB',
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: 'false',
  },
  production: {
    username: 'root',
    password: process.env.AUCTION,
    database: 'auctionDB',
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: 'false',
    logging: false,
  },
};

