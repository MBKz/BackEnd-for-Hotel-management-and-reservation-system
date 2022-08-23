const express = require("express");
const router = express.Router();
const { Hotel, validateHotel } = require("../database/models/hotel");
const { HotelPhone } = require("../database/models/hotelPhone");

router.get("/", async (req, res) => {
  const branches = await Hotel.findAll({
    include: { model: HotelPhone, attributes: ["phone"] },
  });

  if (!branches || branches.length == 0)
    return res.status(404).send({ message: "No branches are found" });

  res.status(200).send({ message: "Okay", branches: branches });
});

router.post("/", async (req, res) => {
  const { error } = validateHotel(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  var hotel = req.body;
  await Hotel.create(hotel,{include:HotelPhone});
  res.status(200).send({message:'New Brach Has Been Added .'})
});

module.exports = router;
