const express = require("express");
const config = require("config");
const transporter = require("../setup/mailTransporter");
const { Client, validateClient } = require("../database/models/client");
const _ = require("lodash");
const bcrypt = require("bcrypt");

async function addClient(body, isValid) {
  var response = { client: '',exist: 0, error: "" };
  // validate
  const { error } = validateClient(body);

  if (error) {
    response.error = `client's data is invalid: ${error.details[0].message}`;
    console.log("client's data is invalid ");
    return response;
  }
  // search
  var client = await Client.findOne({
    where: { email: body.email, isValid: 1 },
  });
  if (client) {
    response.exist = 1;
    response.client = client
    return response;
  }

  var invalidClient = await Client.findOne({
    where: { email: body.email, isValid: 0 },
  });
  if (invalidClient) {
    await invalidClient.destroy();

  }

  client = _.pick(body, [
    "firstName",
    "lastName",
    "email",
    "password",
    "phone",
    "deviceToken",
  ]);

  // hash
  const salt = await bcrypt.genSalt(10);
  client.password = await bcrypt.hash(client.password, salt);

  // add verification key
  const key = Math.floor(Math.random() * 1000000);
  client.verificationKey = key;
  client.isValid = isValid;

  // add
  client = await Client.create(client);
  response.client = client;
  // send email to confirm the client account
  if (!isValid) await sendEmail(client.email, client.verificationKey);

  return response;
}

function sendEmail(email, key) {
  var options = {
    from: config.get("hotelName"),
    to: email,
    subject: "Email confirmation",
    text: String(key),
  };

  transporter.sendMail(options, (err, res) => {
    if (err) console.log(err);
    else console.log("message sent");
  });
}

module.exports = addClient;
