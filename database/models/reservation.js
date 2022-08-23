const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");



class Reservation extends Model {}
Reservation.init(
  {
  checkIn: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  checkOut: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
  accountNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  reservationDate:{ 
      type: DataTypes.DATEONLY,
      allowNull: false
    },
  cost: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
      },
    onLine: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  notes:{
        type: DataTypes.TEXT,
        allowNull: true,
    },
  },
  { sequelize: db, modelName: "Reservation", timestamps: false }
);


function validateReservation(Reservation) {
  const schema = Joi.object({
    accountNumber: Joi.number().integer().min(1000000000).max(999999999),
    reservationDate: Joi.date().required(),
  });
  return schema.validate(Reservation);
}

module.exports.validateReservation = validateReservation;
module.exports.Reservation = Reservation; 