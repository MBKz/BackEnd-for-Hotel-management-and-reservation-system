const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");



class Room extends Model {}
Room.init(
  {
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey:true
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
    locked:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
  },
  { sequelize: db, modelName: "Room", timestamps: false}
);


function validateRoom(Room) {
  const schema = Joi.object({
    number: Joi.number().integer().min(1).required(),
    rate: Joi.number().integer().min(0),
    numberOfRaters: Joi.number().integer().min(0),
    locked: Joi.boolean(),
  });
  return schema.validate(Room);
}

module.exports.validateRoom = validateRoom;
module.exports.Room = Room; 