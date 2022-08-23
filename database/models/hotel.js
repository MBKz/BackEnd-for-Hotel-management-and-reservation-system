const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");



class Hotel extends Model {}
Hotel.init(
  {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    rate: {
      type: DataTypes.DECIMAL(3,2),
      allowNull: false,
      defaultValue: 0.00,
    },
    numberOfRaters:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'homs/profile/1.jpg'
    },
  },
  { sequelize: db, modelName: "Hotel", timestamps: false}
);

function validateHotel(Hotel) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    location: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    city: Joi.string().required(),
    description: Joi.string().required(),
    HotelPhones:Joi.array()
  });
  return schema.validate(Hotel);
}



module.exports.validateHotel = validateHotel;
module.exports.Hotel = Hotel; 