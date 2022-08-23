const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");



class PaymentMethod extends Model {}
PaymentMethod.init(
  {
    method:{
      type: DataTypes.TEXT,
      allowNull:false,
    }
  },
  { sequelize: db, modelName: "PaymentMethod", timestamps: false }
);


function validatePaymentMethod(Bank) {
  const schema = Joi.object({
    method: Joi.string().required(),
   
  });
  return schema.validate(Bank);
}

module.exports.validatePaymentMethod = validatePaymentMethod;
module.exports.PaymentMethod = PaymentMethod; 