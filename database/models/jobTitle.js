const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");



class JobTitle extends Model {}
JobTitle.init(
  {
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: "JobTitle", timestamps: false}
);

function validateJobTitle(JobTitle) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(50).required(),
  });
  return schema.validate(JobTitle);
}



module.exports.validateJobTitle = validateJobTitle;
module.exports.JobTitle = JobTitle;
