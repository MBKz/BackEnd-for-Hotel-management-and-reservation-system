const express = require("express");
const router = express.Router();
const { Hotel } = require("../database/models/hotel");
const { PaidService ,validatePaidService } = require("../database/models/paidServices");
const auth = require("../middleware/auth");

// get all PaidService
router.get("/:hotelId", async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.hotelId);

  if (!hotel) return res.status(404).send({ message: "incorrect hotel id" });

  var paidService = await hotel.getPaidServices();

  if(!paidService) return res.status(404).send({message:`There Is No paidServices`})

  return res.status(200).send({ message: "okay", paidServices: paidService });
});

// add a mew PaidService for a hotel
router.post("/:hotelId", auth, async (req, res) => {

  const newPaidService = req.body;

  const { error } = validatePaidService(newPaidService);

  if (error) return res.status(400).send({ message: error.details[0].message });

  const hotel = await Hotel.findOne({ where: { id: req.params.hotelId } });

  if (!hotel) return res.status(404).send({ message: "incorrect hotel id" });

  var hotelPaidServices = await hotel.getPaidServices();

  hotelPaidServices = hotelPaidServices.map((e) => e.dataValues.name);

  if (hotelPaidServices.includes(newPaidService.name))
    return res.status(400).send({message: `${newPaidService.name} is already existed in this hotel!`,});

  let paidService = await PaidService.findOne({ where: { name: newPaidService.name } });

  if (!paidService)  paidService = await PaidService.create(newPaidService);

  await hotel.addPaidServices([paidService]);

  return res.status(200).send({ message: `${newPaidService.name} Is Added` });
});

// edit PaidService for a hotel
router.put("/", auth, async (req, res) => {

  if (! req.body.cost || !req.body.id) return res.status(400).send({ message: `Invalid Data` });

  let paidService = await PaidService.findOne({ where: { id: req.body.id } });

  if (!paidService) return res.status(400).send({ message: `There Is No Such Service !` });

  paidService.cost = req.body.cost ;

  await paidService.save()

  return res.status(200).send({ message: `Cost Updated !` });
});


// delete PaidService just in hotel
router.delete("/:hotelId", auth, async (req, res) => {

  if (!req.body.name)  return res.status(400).send({ message: "paidService's data is invalid " });

  const hotel = await Hotel.findOne({ where: { id: req.params.hotelId } });

  if (!hotel) return res.status(404).send({ message: "incorrect hotel id" });

  var hotelPaidServices = await hotel.getPaidServices();

  hotelPaidServices = hotelPaidServices.map((e) => e.dataValues.name);

  if (!hotelPaidServices.includes(req.body.name)) return res.status(404).send({ message: `${req.body.name} is not found in ${hotel.name}` });

  var paidService = await PaidService.findOne({ where: { name: req.body.name } });

  await hotel.removePaidService([paidService]);

  //check other hotels first then deleted if not related to other hotels
  // await removePaidService(paidService);

  return res.status(200).send({ message: `${req.body.name} is deleted` });
});

async function removePaidService(paidService) {
  const hotelPaidService = await paidService.getHotels();
  if (!hotelPaidService || hotelPaidService.length == 0) await paidService.destroy();
}

module.exports = router;
