const express = require("express");
const { Notification } = require("../database/models/notification");
const router = express.Router();

//get notification
router.get("/manager", async (req, res) => {
  var notifications = await Notification.findAll({where:{checked: false}});
  if(notifications.length == 0) return res.status(200).send({message:`We Don't Have Notification `,notifications:[]})
  res.status(200).send({ message: "okay", notifications: notifications });
});

//dealt with
router.put("/manager/:id", async (req, res) => {
  if(req.params.id == null) return res.status(400).send({message:`Notification Id Is Required !`});
  var notification = await Notification.findOne({where:{id: req.params.id}});
  if(!notification) return res.status(200).send({message:`We Don't Have Notification With Id ${req.params.id}`});
  notification.checked = true ;
  await notification.save();
  res.status(200).send({ message: "Notification Has Been Dealt With" });
});

module.exports = router;
