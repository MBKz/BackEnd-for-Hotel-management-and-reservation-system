const { Room } = require("../database/models/room");
const { RoomReserved } = require("../database/models/roomReserved");
const { Reservation } = require("../database/models/reservation");
const { RoomFeatures } = require("../database/models/roomFeature");

const { Op } = require("sequelize");



async function getReservedRooms(id ,reqCheckIn, reqCheckOut = reqCheckIn) {
 
  var resRooms = await Reservation.findAll({
    where: {
      HotelId:id,
      [Op.or]: [
        { checkIn: {[Op.between]: [reqCheckIn, reqCheckOut] }},
        { checkOut: { [Op.between]: [reqCheckIn, reqCheckOut] } },
        { [Op.and]:[{ checkIn: {[Op.lte]: reqCheckIn }},{checkOut: {[Op.gte]: reqCheckOut }}]}
        ]
    },
    include: {
      model: Room,
      attributes: ["number"],
    },
  });
 
  resRooms = resRooms.map((e) => e.dataValues.Rooms);

  var rooms = [];
  resRooms.forEach((el) => {
    el.forEach((e) => rooms.push(e));
  });
  rooms = rooms.map((e) => e.RoomReserved.dataValues);

  return rooms;
}



// available date with guests number
async function getAvailableRooms(id ,reqCheckIn, reqCheckOut, guestsNumber ) {
  if(!guestsNumber) guestsNumber=1;
  var AvailableRooms1 = await Room.findAll({
    where: { locked: 0 ,HotelId:id}, 
    include:[ {
      model: Reservation,
      where: {
        [Op.not]: {
          [Op.or]: [
            { checkIn: { [Op.between]: [reqCheckIn, reqCheckOut] } },
            { checkOut: { [Op.between]: [reqCheckIn, reqCheckOut] } },
            {
              [Op.and]: [
                { checkIn: { [Op.lte]: reqCheckIn } },
                { checkOut: { [Op.gte]: reqCheckOut } },
              ],
            },
          ],
        },
      },
      required: true,
    },{
      model: RoomFeatures,
      where: {capacity: {[Op.gte]:guestsNumber}}}]
  });
  //console.log(AvailableRooms1);
  var AvailableRooms2 =await Room.findAll({
    where: {"$Reservations.id$": null ,locked: 0},
    include: [{
      model: Reservation,
      required: false,
    },
    {
      model: RoomFeatures,
      where: {capacity: {[Op.gte]:guestsNumber}}}
    ]
  });
 // console.log(AvailableRooms2)
  AvailableRooms1 = AvailableRooms1.map((e) => e.dataValues);
  AvailableRooms2 = AvailableRooms2.map((e) => e.dataValues);
  let AvailableRooms = AvailableRooms1.concat(AvailableRooms2);
  AvailableRooms = AvailableRooms.map(({number,rate,numberOfRaters,locked,RoomStatusId,HotelId,RoomFeature} )=> ({number,rate,numberOfRaters,locked,RoomStatusId,HotelId,RoomFeature}) )
  return AvailableRooms
}

module.exports.getReservedRooms = getReservedRooms;
module.exports.getAvailableRooms = getAvailableRooms;