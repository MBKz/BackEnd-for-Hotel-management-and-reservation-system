const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");


class Client extends Model {}
Client.init(
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
      allowNull: false,
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
    verificationKey: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    isValid:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }

  },
  { sequelize: db, modelName: "Client", timestamps: false }
);


Client.prototype.getToken = function() {
  const token = jwt.sign({ id: this.id }, config.get("jwtPrivateKey"));
  return token;
};

Client.getToken = function() {
  return 'token';
};
function validateClient(client) {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(255).required(),
    phone: Joi.number().integer().required(),
    deviceToken: Joi.string(),
  });

  return schema.validate(client);
}

module.exports.Client = Client;
module.exports.validateClient = validateClient;
