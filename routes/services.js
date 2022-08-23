const express = require("express");
const router = express.Router();
const { Hotel } = require("../database/models/hotel");
const { Service, validateService } = require("../database/models/service");
const { Employee } = require("../database/models/employee");
const { JobTitle } = require("../database/models/jobTitle");
const auth = require("../middleware/auth");
const admin = require("../setup/firebase_admin");
const { Op } = require("sequelize");
const { Notification } = require("../database/models/notification");
const { Client } = require("../database/models/client");

// get all service
router.get("/:hotelId", async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.hotelId);

  if (!hotel) return res.status(404).send({ message: "incorrect hotel id" });

  var services = await hotel.getServices();

  services = services.map((e) => e.name);

  return res.status(200).send({ message: "okay", services: services });
});

// add a new service for a hotel
router.post("/:hotelId", auth, async (req, res) => {
  const newService = req.body;
  const { error } = validateService(newService);

  if (error) return res.status(400).send({ message: error.details[0].message });

  const hotel = await Hotel.findOne({ where: { id: req.params.hotelId } });

  if (!hotel) return res.status(404).send({ message: "incorrect hotel id" });

  var hotelServices = await hotel.getServices();

  hotelServices = hotelServices.map((e) => e.dataValues.name);

  if (hotelServices.includes(newService.name))
    return res.status(400).send({
      message: `${newService.name} is already existed in this hotel!`,
    });

  var service = await Service.findOne({ where: { name: newService.name } });
  if (!service) service = await Service.create(newService);

  await hotel.addServices([service]);

  return res.status(200).send({ message: `${service.name} is added` });
});

// delete a service from hotel
router.delete("/:hotelId", auth, async (req, res) => {
  var deletedService = req.body;
  const { error } = validateService(deletedService);
  if (error)
    return res.status(400).send({ message: "Service's data is invalid " });

  const hotel = await Hotel.findOne({ where: { id: req.params.hotelId } });
  if (!hotel) return res.status(404).send({ message: "incorrect hotel id" });

  var hotelServices = await hotel.getServices();

  hotelServices = hotelServices.map((e) => e.dataValues.name);

  if (!hotelServices.includes(deletedService.name))
    return res.status(400).send({
      message: `${deletedService.name} is not found in ${hotel.name}`,
    });

  var service = await Service.findOne({ where: { name: deletedService.name } });

  await hotel.removeServices([service]);

  await removeService(service);

  return res
    .status(200)
    .send({ message: `${deletedService.name} service is deleted` });
});

router.post("/order/:hotelId", async (req, res) => {
  var roomNumber = req.body.roomNumber;
  var service = req.body.service;
  var clientId = req.body.clientId;
  var client = await Client.findByPk(clientId);
  var workers = await Employee.findAll({
    where: {
      "$JobTitle.title$": "reception",
      deviceToken: {
        [Op.not]: null,
      },
      HotelId: req.params.hotelId,
    },
    include: [
      {
        model: JobTitle,
      },
    ],
    attributes: ["deviceToken"],
  });
  if (workers.length == 0)
    return res.status(400).send({ message: "there is no receptionists" });
  console.log(workers);
  const promises = [];

  await Notification.create({
    form: clientId,
    title:  `A request from client`,
    body:  ` room ${roomNumber} needs a ${service}`,
  });
  workers.forEach(async(worker) => {
    const message = {
      notification: {
        title: `A request from ${client.dataValues.firstName} ${client.dataValues.lastName}`,
        body: `the client ${clientId} in room ${roomNumber} needs a ${service}`,
      },
      token: worker.dataValues.deviceToken,
    };

    const promise = admin.messaging().send(message);
    promises.push(promise);
   
  });





  Promise.all(promises)
    .then((results) => console.log(results))
    .catch((err) => console.error(err));

  res.status(200).send({ message: "The service has been sent" });
});

async function removeService(service) {
  const hotelService = await service.getHotels();
  if (!hotelService || hotelService.length == 0) await service.destroy();
}

module.exports = router;
