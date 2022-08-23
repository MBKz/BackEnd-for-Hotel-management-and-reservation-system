const { DataTypes, Model } = require('sequelize')
const db = require('../../setup/db')
const Joi = require('joi')

class GuestsName extends Model {}
GuestsName.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { sequelize: db, modelName: 'GuestsName', timestamps: false },
)

function validateGuestsName(GuestsName){
    const schema = Joi.object({
    name: Joi.string()
    });
    return schema.validate(GuestsName);
}

module.exports.GuestsName = GuestsName
module.exports.validateGuestsName = validateGuestsName 