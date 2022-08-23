const { DataTypes, Model } = require('sequelize')
const db = require('../../setup/db')
const Joi = require('joi')

class RoomReserved extends Model {}
RoomReserved.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    guestsNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
  },
  { sequelize: db, modelName: 'RoomReserved', timestamps: false },
)

function validateRoomReserved(RoomReserved) {
  const schema = Joi.object({
    guestsNumber: Joi.number().integer().min(1).max(20).required(),
  })
  return schema.validate(RoomReserved)
}

module.exports.validateRoomReserved = validateRoomReserved
module.exports.RoomReserved = RoomReserved
