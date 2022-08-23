const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");


class Review extends Model {}
Review.init(
  {
    rate: {
      type: DataTypes.DECIMAL(3,2),
      allowNull: false,
      defaultValue: 0.00,
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
  },
  { sequelize: db, modelName: "Review", timestamps: false }
);

function validateReview(Review) {
  const schema = Joi.object({
    comment: Joi.string(),
    rate: Joi.number().required(),
  });
  return schema.validate(Review);
}


module.exports.Review = Review; 
module.exports.validateReview = validateReview;
