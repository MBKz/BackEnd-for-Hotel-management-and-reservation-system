const { Model, DataTypes } = require("sequelize");
const db = require("../../setup/db");


class HotelPaidService extends Model {}
HotelPaidService.init( {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
} , { sequelize: db, modelName: "HotelPaidService", timestamps: false });



module.exports.HotelPaidService = HotelPaidService; 
