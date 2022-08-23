const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");


class Offer extends Model {}
Offer.init(
  {
    isValid: {
      type: DataTypes.BOOLEAN,
      allowNull:false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
  discount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    describe: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
  },
  { sequelize: db, modelName: "Offer", timestamps: false }
);

function validateOffer(Offer) {
  const schema = Joi.object({
    startDate: Joi.date().required() ,
    endDate: Joi.date().required() ,
    discount: Joi.number().required(),
    describe: Joi.string()
  });
  return schema.validate(Offer);
}


module.exports.Offer = Offer; 
module.exports.validateOffer = validateOffer;
