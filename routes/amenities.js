const express = require("express");
const router = express.Router();
const { Hotel } = require("../database/models/hotel");
const { Amenity, validateAmenity } = require("../database/models/amenity");
const auth = require("../middleware/auth");

// get all amenities
router.get("/:hotelId", async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.hotelId);

  if (!hotel) return res.status(404).send({ message: "incorrect hotel id" });

  var amenities = await hotel.getAmenities();

  amenities = amenities.map(({ name, image }) => ({ name, image }));

  return res.status(200).send({ message: "okay", amenities: amenities });
});

// add a mew amenity for a hotel
router.post("/:hotelId", auth, async (req, res) => {
  const newAmenity = req.body;

  const { error } = validateAmenity(newAmenity);

  if (error) return res.status(400).send({ message: error.details[0].message });

  const hotel = await Hotel.findOne({ where: { id: req.params.hotelId } });

  if (!hotel) return res.status(404).send({ message: "incorrect hotel id" });

  var hotelAmenities = await hotel.getAmenities();

  hotelAmenities = hotelAmenities.map((e) => e.dataValues.name);

  if (hotelAmenities.includes(newAmenity.name))
    return res
      .status(200)
      .send({
        message: `${newAmenity.name} is already existed in this hotel!`,
      });

  var amenity = await Amenity.findOne({ where: { name: newAmenity.name } });

  if (!amenity) amenity = await Amenity.create(newAmenity);

  await hotel.addAmenities([amenity]);

  return res.status(200).send({ message: `${amenity.name} Is Added` });
});

// delete just in hotel
router.delete("/:hotelId", auth, async (req, res) => {
  var newAmenity = req.body;

  const { error } = validateAmenity(newAmenity);

  if (error)
    return res.status(400).send({ message: "amenity's data is invalid " });

  const hotel = await Hotel.findOne({ where: { id: req.params.hotelId } });

  if (!hotel) return res.status(404).send({ message: "incorrect hotel id" });

  var hotelAmenities = await hotel.getAmenities();

  hotelAmenities = hotelAmenities.map((e) => e.dataValues.name);

  if (!hotelAmenities.includes(newAmenity.name))
    return res
      .status(404)
      .send({ message: `${newAmenity.name} is not found in ${hotel.name}` });

  var amenity = await Amenity.findOne({ where: { name: newAmenity.name } });

  await hotel.removeAmenities([amenity]);

  await removeAmenity(amenity);

  return res
    .status(200)
    .send({ message: `${newAmenity.name} amenity is deleted` });
});

async function removeAmenity(amenity) {
  const hotelAmenity = await amenity.getHotels();
  if (!hotelAmenity || hotelAmenity.length == 0) await amenity.destroy();
}

module.exports = router;
