const express = require("express");
const router = express.Router();
 const {readdir } = require("fs/promises");
const { Gallery } = require("../database/models/gallery");
const { Hotel } = require("../database/models/hotel");
 
router.get("/branch/:hotelId", async (req, res) => {
  var hotel = await Hotel.findByPk(req.params.hotelId);
  if (!hotel) return res.status(400).send("incorrect hotel ID.");

  var fullGallery = await Gallery.findAll({
    where: { HotelId: req.params.hotelId },
  });

  var gallery = [];
  fullGallery.forEach((e) => {
    gallery.push(e.image);
  });

  res.status(200).send({ message: "okay", availablePic: gallery });
});

router.get("/general", async (req, res) => {

  const images= await readdir('./images/general');
 var general = [];
 images.forEach((i)=>{
   general.push(`general/${i}`);
 })
  res.status(200).send({ message: "okay", availablePic: general });
});

module.exports = router;
