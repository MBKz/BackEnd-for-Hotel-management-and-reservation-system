const { DataTypes, Model } = require('sequelize')
const db = require('../../setup/db')
const Joi = require('joi')

class hotelPaidServicesReserved extends Model {}
hotelPaidServicesReserved.init(
  {},{ sequelize: db, modelName: 'HotelPaidServicesReserved', timestamps: false },
)


module.exports.hotelPaidServicesReserved = hotelPaidServicesReserved
