const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");



class RoomFeatures extends Model {}
RoomFeatures.init(
  {
    floor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    view: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    beds: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue:'damascus/gallery/8.jpg'
      }
  },
  { sequelize: db, modelName: "RoomFeatures", timestamps: false}
);



function validateRoomFeatures(RoomFeatures) {
  const schema = Joi.object({
    floor: Joi.number().integer().min(0).required(),
    capacity: Joi.number().integer().min(1).max(15).required(),
    beds: Joi.number().integer().min(1).max(10).required(),
    price: Joi.number().required(),
    view: Joi.boolean().required()
    });
  return schema.validate(RoomFeatures);
}

module.exports.validateRoomFeatures = validateRoomFeatures;
module.exports.RoomFeatures = RoomFeatures; 