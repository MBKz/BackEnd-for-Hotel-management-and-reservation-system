const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");


class Service extends Model {}
Service.init(
  {
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
  },
  { sequelize: db, modelName: "Service", timestamps: false }
);

function validateService(Service) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });
  return schema.validate(Service);
}


module.exports.Service = Service; 
module.exports.validateService = validateService;
