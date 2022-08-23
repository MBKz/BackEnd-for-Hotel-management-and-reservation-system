const bcrypt = require("bcrypt");
const Joi = require("joi");
const { Client } = require("../database/models/client");
const { Employee } = require("../database/models/employee");

async function signIn(Model, account) {
  let res = { error: "", status: "", token: "", user: "" };
  //validate

  const { error } = await validate(account);
  if (error) {
    res.error = error.details[0].message;
    res.status = 400;
    return res;
  }

  //check user email
  var user;
  
  if (Model == Client)
    user = await Model.findOne({
      where: { email: account.email, isValid: true },
    });
  if (Model == Employee)
    user = await Model.findOne({
      where: { email: account.email },
    });

  if (!user) {
    res.error = "Invalid email or password.";
    res.status = 404;
    return res;
  }
  //check user password
  const validPassword = await bcrypt.compare(account.password, user.password);
  if (!validPassword) {
    res.error = "Invalid email or password.";
    res.status = 400;
    return res;
  }
  //
  user.deviceToken = account.deviceToken;
  await user.save();
  //user is correct
  res.status = 200
  res.token = await user.getToken();
  res.user = user;
  return res;
}

function validate(account) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(4).max(255).required(),
    deviceToken: Joi.string().min(4).max(255).required(),
  });

  return schema.validate(account);
}

module.exports = signIn;
