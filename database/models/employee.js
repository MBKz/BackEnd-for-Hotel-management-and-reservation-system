const { DataTypes, Model, Op } = require("sequelize");
const db = require("../../setup/db");
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require("joi");
const  {JobTitle}= require('./jobTitle')


class Employee extends Model {}
Employee.init(
  {
    firstName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deviceToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  { sequelize: db, modelName: "Employee", timestamps: false }
);

Employee.prototype.getToken = async function() {

  const job = await JobTitle.findByPk(this.JobTitleId);
  const token = jwt.sign({ id: this.id, jobPriority: job.dataValues.priority }, config.get("jwtPrivateKey"));
  return token;
};


function validateEmployee(Employee) {
const schema = Joi.object({
  firstName: Joi.string().min(3).max(50).required(),
  lastName: Joi.string().min(3).max(50).required(),
  phone: Joi.number().integer(),
  email: Joi.string().required().email(),
  password: Joi.string().min(8).max(255).required()
});
return schema.validate(Employee);
}

module.exports.validateEmployee = validateEmployee;
module.exports.Employee = Employee; 