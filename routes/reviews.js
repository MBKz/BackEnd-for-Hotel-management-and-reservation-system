const express = require("express");
const { Op } = require("sequelize");
const { Hotel } = require("../database/models/hotel");
const { Reservation } = require("../database/models/reservation");
const { validateReview, Review } = require("../database/models/reviews");
const router = express.Router();
const _ = require("lodash");
const auth = require("../middleware/auth");

// body{
// 	"HotelId":1,
// 	"ReservationId":2,
// 	"rate":1,
// 	"comment":"good",
// 	"date":"2020-1-1"
// }

async function reviewCalculator(review, option) {
  var reservation = await Reservation.findByPk(review.ReservationId);
  var rooms = await reservation.getRooms();
  rooms.forEach(async (room) => {
    var newNumberOfRoomRaters;
    var newRoomRate;
    if (option == "add") {
      newNumberOfRoomRaters = room.numberOfRaters + 1;
      newRoomRate =
        (room.rate * room.numberOfRaters + review.rate) / newNumberOfRoomRaters;
    } else if (option == "delete") {
      newNumberOfRoomRaters = room.numberOfRaters - 1;
      if (newNumberOfRoomRaters <= 0) {
        newRoomRate = 0;
      } else {
        newRoomRate =
          (room.rate * room.numberOfRaters - review.rate) /
          newNumberOfRoomRaters;
      }
    }
    room.rate = newRoomRate;
    room.numberOfRaters = newNumberOfRoomRaters;
    await room.save();
  });

  var hotel = await Hotel.findByPk(review.HotelId);

  var newNumberOfHotelRaters = 0;
  var newHotelRate = 0;
  console.log(hotel.numberOfRaters);
  if (option == "add") {
    newNumberOfHotelRaters = hotel.numberOfRaters + 1;
    newHotelRate =
      (hotel.rate * hotel.numberOfRaters + review.rate) /
      newNumberOfHotelRaters;
  } else if (option == "delete") {
    newNumberOfHotelRaters = hotel.numberOfRaters - 1;
    if (newNumberOfHotelRaters == 0) newHotelRate = 0;
    else
      newHotelRate =
        (hotel.rate * hotel.numberOfRaters - review.rate) /
        newNumberOfHotelRaters;
  }

  hotel.rate = newHotelRate;
  hotel.numberOfRaters = newNumberOfHotelRaters;

  console.log(hotel.numberOfRaters);
  await hotel.save();

  return 1;
}

router.get("/oneReview/:hotelId/:reservationId", auth, async (req, res) => {
  var reservationId = req.params.reservationId;
  var hotelId = req.params.hotelId;

  const review = await Review.findOne({
    where: { ReservationId: reservationId, HotelId: hotelId },
  });
  if (!review)
    return res.status(200).send({ message: "Please rete us", review: null });

  res.status(200).send({
    message: "Thanks for rating",
    review: _.pick(review, ["rate", "comment", "date"]),
  });
});

router.post("/", auth, async (req, res) => {
  const { error } = validateReview({
    comment: req.body.comment,
    rate: req.body.rate,
  });
  if (error)
    return res
      .status(400)
      .send({ message: `Error : ${error.details[0].message}` });
  var review = new Review();
  review = req.body;

  review = await Review.create(review);
  if (review) await reviewCalculator(review, "add");

  res.status(200).send({ message: "done" });
});

router.put("/", auth, async (req, res) => {
  const { error } = validateReview({
    comment: req.body.comment,
    rate: req.body.rate,
  });
  if (error)
    return res
      .status(400)
      .send({ message: `Error : ${error.details[0].message}` });

  var reservationId = req.body.ReservationId;
  var hotelId = req.body.HotelId;
  const review = await Review.findOne({
    where: { ReservationId: reservationId, HotelId: hotelId },
  });
  if (!review)
    return res
      .status(404)
      .send({ message: "This reservation does not has a review" });

  await reviewCalculator(review, "delete");
  review.rate = req.body.rate;
  review.comment = req.body.comment;
  await review.save();

  await reviewCalculator(review, "add");

  res.status(200).send({ message: "done" });
});

router.delete("/", auth, async (req, res) => {
  var reservationId = req.body.ReservationId;
  var hotelId = req.body.HotelId;
  const review = await Review.findOne({
    where: { ReservationId: reservationId, HotelId: hotelId },
  });
  if (!review)
    return res.status(404).send("This reservation does not has a review");

  await reviewCalculator(review, "delete");
  await review.destroy();
  res.status(200).send({ message: "done" });
});

router.get("/all/:hotelId", async (req, res) => {
  var reviewObject = {};
  var hotelId = req.params.hotelId;
  var hotel = await Hotel.findByPk(hotelId);

  var allReview = await Review.findAll({HotelId:hotelId});
  var reviewers = [];
  allReview.forEach(async (review) => {
    var clientReview = {};
    var reservation = await review.getReservation();
    var client = await reservation.getClient();
    clientReview.name = client.firstName;
    clientReview.rate = review.rate;
    clientReview.comment = review.comment;
    clientReview.date = review.date;
    reviewers.push(clientReview);
  });
  var fiveStar = (
    await Review.findAll({ where: { rate: { [Op.between]: [4.1, 5] },HotelId:hotelId } })
  ).length;
  var fourStar = (
    await Review.findAll({ where: { rate: { [Op.between]: [3.1, 4] },HotelId:hotelId } })
  ).length;
  var threeStar = (
    await Review.findAll({ where: { rate: { [Op.between]: [2.1, 3] },HotelId:hotelId } })
  ).length;
  var twoStar = (
    await Review.findAll({ where: { rate: { [Op.between]: [1.1, 2] },HotelId:hotelId } })
  ).length;
  var oneStar = (
    await Review.findAll({ where: { rate: { [Op.between]: [0.1, 1] },HotelId:hotelId } })
  ).length;

  reviewObject.hotelRate = hotel.rate;

  allReview = allReview.length;
  reviewObject.allReview = allReview;

  if (allReview == 0) allReview = 1;

  reviewObject.fiveStarPerCent = Math.round((fiveStar / allReview) * 100);
  reviewObject.fiveStarRater = fiveStar;

  reviewObject.fourStarPerCent = Math.round((fourStar / allReview) * 100);

  reviewObject.fourStarRater = fourStar;

  reviewObject.threeStarPerCent = Math.round((threeStar / allReview) * 100);

  reviewObject.threeStarRater = threeStar;

  reviewObject.twoStarPerCent = Math.round((twoStar / allReview) * 100);

  reviewObject.twoStarRater = twoStar;

  reviewObject.oneStarPerCent = Math.round((oneStar / allReview) * 100);

  reviewObject.oneStarRater = oneStar;

  reviewObject.reviewers = reviewers;
  res.status(200).send({ review: reviewObject });
});

module.exports = router;
