const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {RoomFeatures,validateRoomFeatures,} = require("../database/models/roomFeature");
const { Room } = require("../database/models/room");
const db = require("../setup/db");

let floor = [],
  capacity = [],
  price = [],
  beds = [],
  view = [],
  filtersResult = [],
  roomFeatures = [];
let filterNum = 0,
  repeat = 0;

// get all rooms
router.get("/getRooms/:HotelId", auth, async (req, res) => {
  const rooms = await Room.findAll({
    where: { HotelId: req.params.HotelId },
    include: [{ model: RoomFeatures }],
  });
  if (!rooms)
    return res.status(404).send({ message: `We Don't Have Any Room Yet !` });
  return res.status(200).send({ message: `Okay`, rooms: rooms });
});

// manage room state
router.put("/changeRoomState", async (req, res) => {
  // validate
  if (!req.body.roomNumber || !req.body.state)
    return res
      .status(400)
      .send({ message: `roomNumber And State Are Required !` });
  // change
  if (req.body.state == "lock") {
    const room = await Room.findByPk(req.body.roomNumber);
    if (!room)
      return res.status(404).send({ message: `There Is No Such Room` });
    room.locked = true;
    await room.save();
  }
  if (req.body.state == "free") {
    const room = await Room.findByPk(req.body.roomNumber);
    if (!room)
      return res.status(404).send({ message: `There Is No Such Room` });
    room.locked = false;
    await room.save();
  }

  return res.status(200).send({
    message: `the status of room number ${req.body.roomNumber} successfully changed to ${req.body.state}.`,
  });
});

// get all rooms features
router.get("/getRoomFeatures", auth, async (req, res) => {
  const features = await RoomFeatures.findAll();
  if (!features)
    return res
      .status(404)
      .send({ message: `couldn't find any set of features !` });
  return res.status(200).send(features);
});

// get features id's
async function getRoomFeatures(req) {
  // reset stuff
  (floor = []),
  (capacity = []),
  (price = []),
  (beds = []),
  (view = []),
  (filtersResult = []),
  (roomFeatures = []);
  (filterNum = 0), (repeat = 0);

  // all params
  if (
    req.body.floor &&
    req.body.capacity &&
    req.body.beds &&
    req.body.price &&
    req.body.view
  ) {
    roomFeatures = await RoomFeatures.findAll({
      where: {
        floor: req.body.floor,
        capacity: req.body.capacity,
        beds: req.body.beds,
        price: req.body.price,
        view: req.body.view,
      },
    });
    roomFeatures = roomFeatures.map((e) => e.id);
    return roomFeatures;
  }

  // floor filter
  if (req.body.floor) {
    filterNum++;
    floor = await RoomFeatures.findAll({
      where: { floor: req.body.floor },
    });
    floor = floor.map((e) => e.id);
  }

  // capacity filter
  if (req.body.capacity) {
    filterNum++;
    capacity = await RoomFeatures.findAll({
      where: { capacity: req.body.capacity },
    });
    capacity = capacity.map((e) => e.id);
    console.log("cccc");
  }

  // beds filter
  if (req.body.beds) {
    filterNum++;
    beds = await RoomFeatures.findAll({ where: { beds: req.body.beds } });
    beds = beds.map((e) => e.id);
  }

  // price filter
  if (req.body.price) {
    filterNum++;
    price = await RoomFeatures.findAll({
      where: { price: req.body.price },
    });
    price = price.map((e) => e.id);
  }

  // view filter
  if (req.body.view) {
    filterNum++;
    view = await RoomFeatures.findAll({
      where: { view: req.body.view },
    });
    view = view.map((e) => e.id);
  }

  // concat
  filtersResult = floor.concat(capacity, beds, price, view);
  // delete repeated rooms - intersection
  if (filterNum === 1) roomFeatures = filtersResult;
  else {
    for (let i = 0; i < filtersResult.length; i++) {
      repeat = 0;
      for (let j = i; j < filtersResult.length; j++) {
        if (filtersResult[i] === filtersResult[j]) {
          repeat++;
          if (repeat === filterNum) {
            roomFeatures.push(filtersResult[i]);
            repeat = 0;
          }
        }
      }
    }
  }

  return roomFeatures;
}

// affected rooms
router.put("/affectedRooms", auth, async (req, res) => {
  let rooms = [];
  // get features id's
  const features = await getRoomFeatures(req);

  // edit
  if (!features || features.length == 0)
    return res
      .status(404)
      .send({ message: "There Are No Rooms That Have Such Features !" });

  for (const e of features) {
    // affected rooms
    let temp = await Room.findAll({
      where: { RoomFeatureId: e },
      include: RoomFeatures,
    });
    rooms.push.apply(rooms, temp);
  }

  if (rooms.length == 0)
    return res
      .status(404)
      .send({ message: `There Are No Rooms That Have Such Features !` });

  rooms = rooms.map((e) => e.dataValues);
  return res.status(200).send({ message: `Okay.`, affectedRooms: rooms });
});

// manage rooms price
router.put("/editUsingRoomFeature", auth, async (req, res) => {
  let field = [];
  let obj = {};

  // validate toChange
  if (
    req.body.toChange != "price" &&
    req.body.toChange != "beds" &&
    req.body.toChange != "capacity"
  )
    return res.status(404).send({ message: "You Can't Change That !" });

  // get features id's
  const features = await getRoomFeatures(req);
  if (!features || features.length == 0)
    return res
      .status(404)
      .send({ message: "There Is No Rooms That Have Such Features !" });

  // edit
  for (const e of features) {
    const edit = await RoomFeatures.findOne({ where: { id: e } });
    if (req.body.toChange == "price")
      edit.price = edit.price + edit.price * req.body.value;
    if (req.body.toChange == "beds") edit.beds += req.body.value;
    if (req.body.toChange == "capacity") edit.capacity += req.body.value;

    // validate
    obj.floor = edit.floor;
    obj.capacity = edit.capacity;
    obj.beds = edit.beds;
    obj.price = edit.price;
    obj.view = edit.view;
    const { error } = validateRoomFeatures(obj);
    if (error) {
      field.push(`${error.details[0].message} For Feature With Id : ${e}`);
    } else await edit.save();
  }

  return res.status(200).send({
    message: `Updated Features With Id : [${features}]`,
    field: field,
  });
});

// add new room
router.post("/addRooms", auth, async (req, res) => {
  let room = {};
  let featureObj = {};
  featureObj = req.body.features;
  let featureId,
    invalid = [],
    numbers = [];
  numbers = req.body.numbers;

  // validate
  for (const i of numbers) {
    const searchRoom = await Room.findByPk(i);
    if (searchRoom) invalid.push(i);
  }
  if (invalid.length != 0)
    return res
      .status(400)
      .send({ message: `We Have Rooms With The Numbers [${invalid}]` });
  const { error } = validateRoomFeatures(featureObj);
  if (error) return res.status(400).send({ message: error.details[0].message });
  if (!req.body.HotelId || !numbers || numbers.length == 0)
    return res
      .status(400)
      .send({ message: `Missing Hotel Id Or Room Number !` });

  try {
    const result = await db.transaction(async (t) => {
      // get features
      const feature = await RoomFeatures.findOne({
        where: {
          floor: featureObj.floor,
          capacity: featureObj.capacity,
          beds: featureObj.beds,
          price: featureObj.price,
          view: featureObj.view,
        },
        transaction: t,
      });
      if (!feature) {
        const newFeature = await RoomFeatures.create(featureObj, {
          transaction: t,
        });
        featureId = newFeature.dataValues.id;
      } else featureId = feature.dataValues.id;

      // fill and create
      for (const n of numbers) {
        room.HotelId = req.body.HotelId;
        room.RoomFeatureId = featureId;
        room.RoomStatusId = 1;
        room.number = n;
        await Room.create(room, { transaction: t });
      }
      return res.status(200).send({
        message: `New Rooms Has Been Created With The Numbers [${numbers}]`,
      });
    });
  } catch (error) {
    console.log(`[${error}] `);
    return res
      .status(400)
      .send({ message: `Oops +_+ something went wrong , please try again` });
  }
});

//TODO: add offer / edit offer / delete offer

module.exports = router;
