const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");


class PaidService extends Model {}
PaidService.init(
  {
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
   cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
  },
  },
  { sequelize: db, modelName: "PaidService", timestamps: false }
);

function validatePaidService(Service) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    cost: Joi.number().required()
  });
  return schema.validate(Service);
}


module.exports.PaidService = PaidService; 
module.exports.validatePaidService = validatePaidService;
