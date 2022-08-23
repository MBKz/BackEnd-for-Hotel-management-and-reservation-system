const express = require("express");
const Joi = require("joi");
const { Client } = require("../database/models/client");
const { Employee } = require("../database/models/employee");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/client", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ message: `Error : ${error.details[0].message}` });

  var client = await Client.findByPk(req.user.id);
  client.token = req.body.token;
  await client.save();

  res.send("The device's token has been updated");

});

router.get("/employee", auth, async (req, res) => {

  const { error } = validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ message: `Error : ${error.details[0].message}` });

  var employee = await Employee.findByPk(req.user.id);
  employee.token = req.body.token;
  await employee.save();
  
  res.send("The device's token has been updated");
  
});

function validate(token) {
  var schema = Joi.object({
    token: Joi.string().required(),
  });
  return schema.validate(token);
}


module.exports = router;