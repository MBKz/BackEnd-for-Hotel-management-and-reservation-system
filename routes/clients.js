const express = require("express");
const router = express.Router();
const { Client, validateClient } = require("../database/models/client");
const addClient = require("../serviceObjects/addClient");
const { Reservation } = require("../database/models/reservation");
const { Hotel } = require("../database/models/hotel");
const { Room } = require("../database/models/room");
const { RoomFeatures } = require("../database/models/roomFeature");
const reservationsFullInfo = require("../serviceObjects/getReservations");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const auth = require("../middleware/auth");
const { Op } = require("sequelize");
const { Review } = require("../database/models/reviews");

//register
router.post("/register", async (req, res) => {
  const { exist, error } = await addClient(req.body, false);
  if (error) return res.status(404).send({ message: error });
  if (exist)
    return res.status(404).send({ message: "the client already exists !" });
  return res
    .status(200)
    .send({ message: "A verification key is sent to confirm your account" });
});

//verify  the client account
router.post("/verification", async (req, res) => {
  var client = await Client.findOne({
    where: { email: req.body.email, verificationKey: req.body.verificationKey },
  });
  if (!client) return res.status(400).send({ message: "Invalid key!" });

  client.isValid = true;
  await client.save();
  const token = await client.getToken();
  return res.header("auth-token", token).send({
    message: "The registering process is done successfully",
    client: _.pick(client, [
      "firstName",
      "lastName",
      "phone",
      "email",
      "password",
    ]),
  });
});

//profile
router.get("/me", auth, async (req, res) => {
  const me = await Client.findOne({
    where: { id: req.user.id },
  });
  me.password = "";
  res
    .status(200)
    .send(
      _.pick(me, ["id", "firstName", "lastName", "email", "password", "phone"])
    );
});

// edit profile
router.put("/editProfile", auth, async (req, res) => {
  const me = await Client.findOne({ where: { id: req.user.id } });
  let user = _.pick(req.body, ["id", "firstName", "lastName", "email", "password", "phone"])
  const { error } = validateClient(user);
  if (error)  return res.status(400).send({ message: `Error : ${error.details[0].message}` });
  if(req.body.newPassword == "") return res.status(400).send({ message:`New Password Is Needed !`});

  // check password

  const validPassword = await bcrypt.compare(req.body.password, me.password);
  if (!validPassword) return res.status(400).send({message:`Invalid Password `});

  me.firstName = req.body.firstName;
  me.lastName = req.body.lastName;
  me.phone = req.body.phone;
  me.email = req.body.email;
  //me.password = req.body.newPassword;

  const salt = await bcrypt.genSalt(10);
  me.password = await bcrypt.hash(req.body.newPassword, salt);
  console.log(req.body.newPassword);
  await me.save();
  me.password = "";
  return res
    .status(200)
    .send({message: `Profile Edited Successfully .`});
});

//view all Reservations
router.get("/finished", auth, async (req, res) => {
  const now = new Date().toDateString();

  let reservations = await Reservation.findAll({
    where: { ClientId: req.user.id, checkOut: { [Op.lte]: now } },
  });

  const resObject = await reservationsFullInfo(reservations);
  res.status(resObject.status).send(resObject.body);
});

// viw my reviews
router.get("/myReviews/:clientId", auth, async (req, res) => {
  const clientId = req.params.clientId;

  var reviews = await Reservation.findAll({
    where: { ClientId: clientId },
    include: { model: Review, required: true,include:Hotel },
  });
 
  // var allReviews = [];
  // reviews.forEach((e) => allReviews.push(e.Review));
  res.send({ message: "okay", reviews: reviews });
});

// view specific review
router.get("/reservationReview/:id", auth, async (req, res) => {

  var reservation = await Reservation.findOne({where: { id: req.params.id},});

  const resObject = await reservationsFullInfo([reservation]);
  return res.status(resObject.status).send(resObject.body);
});

//view upComing Reservations
router.get("/upComing", auth, async (req, res) => {
  const now = new Date().toDateString();

  let reservations = await Reservation.findAll({
    where: { ClientId: req.user.id, checkIn: { [Op.gt]: now } },
  });
  const resObject = await reservationsFullInfo(reservations);
  return res.status(resObject.status).send(resObject.body);
});

//view online Reservations
router.get("/onGoing", auth, async (req, res) => {
  const now = new Date().toDateString();

  let reservations = await Reservation.findAll({
    where: {
      ClientId: req.user.id,
      [Op.and]: [
        { checkIn: { [Op.lte]: now } },
        { checkOut: { [Op.gte]: now } },
      ],
    },
  });

  const resObject = await reservationsFullInfo(reservations);
  return res.status(resObject.status).send(resObject.body);
});

// get my online rooms
router.get("/myOnlineRooms/:hotelId/:roomNumber", auth, async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.hotelId);
  if (!hotel) return res.status(404).send({ message: "Hotel id is not valid" });

  var room = await Room.findOne({
    where: { HotelId: req.params.hotelId, number: req.params.roomNumber },
    include: [{ model: RoomFeatures }],
  });
  if (!room) return res.status(404).send({ message: `Room Not Found` });
  return res.status(200).send({ message: `Okay`, room: room });
});


module.exports = router;
