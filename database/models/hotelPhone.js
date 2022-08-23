const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");



class HotelPhone extends Model {}
HotelPhone.init(
  {
    phone: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: "HotelPhone", timestamps: false}
);

function validateHotelPhone(HotelPhone) {
  const schema = Joi.object({
    phone: Joi.number().integer().min(100000000000).max(999999999999).required(),
  });
  return schema.validate(HotelPhone);
}



module.exports.validateHotelPhone = validateHotelPhone;
module.exports.HotelPhone = HotelPhone;
