const { Model } = require("sequelize");
const db = require("../../setup/db");


class HotelService extends Model {}
HotelService.init( {} , { sequelize: db, modelName: "HotelService", timestamps: false });



module.exports.HotelService = HotelService; 

