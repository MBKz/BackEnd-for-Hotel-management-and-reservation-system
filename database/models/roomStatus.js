const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");




class RoomStatus extends Model {}
RoomStatus.init(
  {
    state: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: "RoomStatus", timestamps: false }
);

function validateRoomStatus(RoomStatus) {
  const schema = Joi.object({
    state: Joi.string().required(),
  });
  return schema.validate(RoomStatus);
}

module.exports.validate = validateRoomStatus;
module.exports.RoomStatus = RoomStatus; 