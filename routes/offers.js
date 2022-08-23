const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const { Offer, validateOffer } = require("../database/models/offers");
const auth = require("../middleware/auth");

// show Offer
router.get("/:hotelId",auth, async (req, res) => {
  const now = new Date().toDateString();
  const offers = await Offer.findAll({
    where: {
      isValid: true,
      HotelId: req.params.hotelId,
      [Op.or]: [
        {
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now },
        },
        {
          startDate: { [Op.gte]: now },
          endDate: { [Op.gte]: now },
        },
      ],
    },
  });
  if (!offers || offers.length == 0) return res.status(404).send({ message: `There Is No Offers Right Now !` });

  return res.status(200).send({ message: `Okay`, offers: offers });
});

// add offer
router.post("/:hotelId",auth, async (req, res) => {

  const { error } = validateOffer(req.body);
  if (error) return res.status(400).send({message: `offer's data is invalid: ${error.details[0].message}`,});
  const start = req.body.startDate;
  const end = req.body.endDate;

  const now = new Date().toDateString();
  var currentOffer = await Offer.findOne({
    where: {
      isValid: true,
      HotelId: req.params.hotelId,
      [Op.or]: [
        { startDate: { [Op.between]: [start, end] } },
        { endDate: { [Op.between]: [start, end] } },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: start } },
            { endDate: { [Op.gte]: end } },
          ],
        },
      ],
    },
  });
  if (currentOffer) return res.status(400).send({ message: "You have an offer in the same date On Going" });

  var offer = req.body;
  offer.isValid = true;
  offer.HotelId = req.params.hotelId;
  await Offer.create(offer);

  return res.status(200).send({ message: "the offer is added" });
});

// stop Offer
router.put("/:offerId",auth, async (req, res) => {
  const offer = await Offer.findByPk(req.params.offerId);
  if (!offer) return res.status(404).send({message: `offer's id is invalid`,});
  offer.isValid = false;
  await offer.save();
  return res.status(200).send({ message: "The Offer Is Stopped" });
});

module.exports = router;
