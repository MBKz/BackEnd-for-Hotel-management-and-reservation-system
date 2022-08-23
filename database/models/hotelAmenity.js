const { Model } = require("sequelize");
const db = require("../../setup/db");

class hotelAmenity extends Model {}
hotelAmenity.init( {} , { sequelize: db, modelName: "hotelAmenity", timestamps: false });


module.exports.hotelAmenity = hotelAmenity; 
