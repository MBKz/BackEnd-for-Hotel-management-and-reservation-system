const { DataTypes, Model } = require('sequelize')
const db = require('../../setup/db')
const Joi = require('joi')

class Notification extends Model {}
Notification.init(
  {

    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
    ,
    checked:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue:false
    }
  },
  { sequelize: db, modelName: 'Notification', timestamps: false },
)

function validateNotification(Notification) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
  })
  return schema.validate(Notification)
}

module.exports.Notification = Notification
module.exports.validateNotification = validateNotification
