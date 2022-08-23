const { DataTypes, Model } = require('sequelize')
const db = require('../../setup/db')
const Joi = require('joi')

class Amenity extends Model {}
Amenity.init(
  {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue:"amenities/concierge.png"
    }
  },
  { sequelize: db, modelName: 'Amenity', timestamps: false },
)

function validateAmenity(Amenity) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
  })
  return schema.validate(Amenity)
}

module.exports.Amenity = Amenity
module.exports.validateAmenity = validateAmenity
