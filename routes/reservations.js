const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Reservation } = require("../database/models/reservation");
const { Room } = require("../database/models/room");
const { Client } = require("../database/models/client");
const { Offer } = require("../database/models/offers");
const { Op } = require("sequelize");
const reservationsFullInfo = require("../serviceObjects/getReservations");
const { Hotel } = require("../database/models/hotel");
const { hotelPaidServicesReserved } = require("../database/models/hotelPaidServicesReserved");
const { HotelPaidService } = require("../database/models/hotelPaidServices");
const { PaidService } = require("../database/models/paidServices");
const { RoomFeatures } = require("../database/models/roomFeature");

// FIXME: use the api in offers route
// // show Offer
// router.get("/showOffers/:hotelId"  ,auth, async(req,res) => {
  
//   const offer = await Offer.findOne({where: {isValid: true , HotelId: req.params.hotelId}});

//   if(!offer) return res.status(404).send({message: `There Is No Offer Right Now !`});

//   return res.status(200).send({message:`Okay` , offer: offer});

// });

// get all reservations
router.get("/:hotelId",auth, async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.hotelId);
  if (!hotel) return res.status(404).send({ message: "Hotel id is not valid" });

  var reservations = await Reservation.findAll({
    where: { HotelId: req.params.hotelId },
  });
  const resObject = await reservationsFullInfo(reservations);
  return res.status(resObject.status).send(resObject.body);
});

// view Reservations by client id // in what case we need this ?!
router.get("/byClientId/:clientId", auth, async (req, res) => {
  var client = await Client.findByPk(req.params.clientId);
  if (!client)
    return res.status(404).send({ message: "We don't have this client !" });

  var reservations = await Reservation.findAll({
    where: { clientId: req.params.clientId },
  });

  const resObject = await reservationsFullInfo(reservations);
  return res.status(resObject.status).send(resObject.body);
});

// view Reservations by client Name And Phone
router.put("/byClientName", auth, async (req, res) => {
  if (!req.body.firstName || !req.body.lastName || !req.body.phone)
    return res
      .status(400)
      .send({ message: `Full Name And Phone is required !` });

  var client = await Client.findOne({
    where: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
    },
  });
  if (!client)
    return res.status(404).send({ message: "We don't have this client !" });

  var reservations = await client.getReservations();

  const resObject = await reservationsFullInfo(reservations);
  return res.status(resObject.status).send(resObject.body);
});

// view Reservations by room number
router.get("/byRoomNumber/:roomNumber", auth, async (req, res) => {
  var room = await Room.findByPk(req.params.roomNumber);

  if (!room)
    return res.status(404).send({ message: "This room is not found !" });

  var reservations = await room.getReservations();

  const resObject = await reservationsFullInfo(reservations);
  return res.status(resObject.status).send(resObject.body);
});

// view Reservations by reservation id
router.get("/byId/:id", auth, async (req, res) => {
  var reservations = [];
 var reservation =  await Reservation.findByPk(req.params.id);
 if(!reservation)
  return res.status(404).send({message: 'Invalid reservation Id'})

  reservations.push(reservation);

  const resObject = await reservationsFullInfo(reservations);
  return res.status(resObject.status).send(resObject.body);
});

// by specific date
router.put("/bySpecificDate/:hotelId", auth, async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.hotelId);
  if (!hotel) return res.status(404).send({ message: "Hotel id is not valid" });

  var reservations = await Reservation.findAll({
    where: {
      [Op.and]: [
        { checkIn: { [Op.lte]: req.body.date } },
        { checkOut: { [Op.gte]: req.body.date } },
      ],
      HotelId: req.params.hotelId,
    },
  });

  const resObject = await reservationsFullInfo(reservations);
  return res.status(resObject.status).send(resObject.body);
});

// UpComing Reservations
router.get("/upComing/:hotelId", auth, async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.hotelId);
  if (!hotel) return res.status(404).send({ message: "Hotel id is not valid" });

  let today = new Date();
  // today = today.getFullYear() +'-' +(today.getMonth() + 1) +'-' +(today.getDate());

  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  // tomorrow = tomorrow.getFullYear() +'-' +(tomorrow.getMonth() + 1) +'-' +(tomorrow.getDate());

  let afterMonth = new Date(today);
  afterMonth.setDate(afterMonth.getDate() + 60);
  // afterMonth = afterMonth.getFullYear() +'-' +(afterMonth.getMonth() + 1) +'-' +(afterMonth.getDate());

  var reservations = await Reservation.findAll({
    where: {
      checkIn: { [Op.between]: [tomorrow, afterMonth] },
      HotelId: req.params.hotelId,
    },
  });

  const resObject = await reservationsFullInfo(reservations);
  return res.status(resObject.status).send(resObject.body);
});

// recently Reservations
router.get("/recently/:hotelId", auth, async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.hotelId);
  if (!hotel) return res.status(404).send({ message: "Hotel id is not valid" });

  let today = new Date();
  // today = today.getFullYear() +'-' +(today.getMonth() + 1) +'-' +(today.getDate());

  let yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  // yesterday = today.getFullYear() +'-' +(today.getMonth() + 1) +'-' +(today.getDate());

  let beforeMonth = new Date(today);
  beforeMonth.setDate(beforeMonth.getDate() - 60);
  // beforeMonth = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

  var reservations = await Reservation.findAll({
    where: {
      checkOut: { [Op.between]: [beforeMonth, yesterday] },
      HotelId: req.params.hotelId,
    },
  });

  const resObject = await reservationsFullInfo(reservations);
  return res.status(resObject.status).send(resObject.body);
});

module.exports = router;
