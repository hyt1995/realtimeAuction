const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || 'development';
const config = require("../config/config")[env];
const db = {};


const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.Auction = require("./auction")(sequelize, Sequelize);
db.Good = require("./good")(sequelize, Sequelize);
db.CompanyUser = require("./companyUser")(sequelize, Sequelize);
db.Room = require("./room")(sequelize, Sequelize);

db.CompanyUser.hasMany(db.Auction);
db.Auction.belongsTo(db.CompanyUser);

db.Auction.hasMany(db.Good);
db.Good.belongsTo(db.Auction);


/////
db.CompanyUser.hasMany(db.Good);
db.Good.belongsTo(db.CompanyUser);


db.CompanyUser.belongsToMany(db.Room, {through:"AuctionParticipation"})
db.Room.belongsToMany(db.CompanyUser,{through:"AuctionParticipation"})

db.Room.hasMany(db.Auction);
db.Auction.belongsTo(db.Room);

db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;
















