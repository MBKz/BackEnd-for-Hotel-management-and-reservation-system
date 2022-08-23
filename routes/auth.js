const express = require("express");
const router = express.Router();
const { Client } = require("../database/models/client");
const { Employee } = require("../database/models/employee");
const singIn = require("../serviceObjects/signIn");
const _ = require("lodash");
const signIn = require("../serviceObjects/signIn");

// sign in client
router.post("/client", async (req, res) => {
  const { error, status, token, user } = await signIn(Client, req.body);

  if (error) return res.status(status).send({ message: `${error}` });

  return res
    .status(200)
    .header("auth-token", token)
    .send({ message: `Valid Account`, client: user });
});

// sign in employee
router.post("/employee", async (req, res) => {
  const { error, status, token, user } = await singIn(Employee, req.body);

  if (error) return res.status(status).send({ message: `${error}` });

  const jobTitle = await user.getJobTitle();

  user.jobTitle = jobTitle.title;

  return res
    .status(200)
    .header("auth-token", token)
    .send({ message: "Valid Account", employee: user });
});

router.post("/employee/start", async (req, res) => {
  const { email } = req.body;

  const employee = await Employee.findOne({ where: { email: email } });
  if (!employee) return res.status(404).send({ message: "not fount" });

  return res.status(200).send({ message: "Valid Account" });
});

router.post("/client/start", async (req, res) => {
  const { email } = req.body;

  const employee = await Client.findOne({ where: { email: email } });
  if (!employee) return res.status(404).send({ message: "not fount" });

  return res.status(200).send({ message: "Valid Account" });
});

router.post("/client/logout", async (req, res) => {
  const { email } = req.body;

  logout(Client, email);

  return res.status(200).send({ message: "log out" });
});
router.post("/employee/logout", async (req, res) => {
  
  const { email } = req.body;

  logout(Employee, email);

  return res.status(200).send({ message: "log out" });
});
async function logout(Model, email) {
  var user = await Model.findOne({ where: { email: email } });
  user.deviceToken = null;
  user.save();
  return;
}

module.exports = router;
