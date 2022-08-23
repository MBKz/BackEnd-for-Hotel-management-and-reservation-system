const { RoomReserved } = require("../database/models/roomReserved");
const { HotelPaidService } = require("../database/models/hotelPaidServices");
const { PaidService } = require("../database/models/paidServices");


async function reservationsFullInfo(reservations) {

  if (!reservations) {
    return { status: 404, body: { message: "An error has been occurred" } };
  }
  if (reservations.length == 0) {
    return {
      status: 200,
      body: {
        message: "Oops! , There Is No Reservations ",
        reservations: reservations,
      },
    };
  }
  const reservationsInfo = await reservationsFullData(reservations);
  return {
    status: 200,
    body: { message: "Okay", reservations: reservationsInfo },
  };
  
  
}

async function reservationsFullData(reservations){

  var reservationInfo = [];

  for (const reservation of reservations) {
    var obj = {} ,finalRooms = [] ,finalServices = [];

    let client = await reservation.getClient();
    obj.clientData = client.dataValues;

    const hotel = await reservation.getHotel()
    const hotelName = hotel.dataValues.name;
    reservation.dataValues.hotelName = hotelName
    obj.reservationData  = reservation.dataValues;

    
    let services = await reservation.getHotelPaidServicesReserveds();
    for (const service of services) {
      let tempService = await HotelPaidService.findOne({where: { id: service.dataValues.HotelPaidServiceId }}) ;
      let tempSer = await PaidService.findOne({where: { id: tempService.dataValues.PaidServiceId }}) ;

      finalServices.push(tempSer.dataValues);
    }
    obj.servicesData = finalServices ;


    let rooms = await reservation.getRooms();

    for (const room of rooms) {
      let tempRoom = {} ;
      let guestsNumber = (await RoomReserved.findOne({where:{ReservationId:reservation.dataValues.id ,RoomNumber: room.number}})).dataValues.guestsNumber ;
      let cost = (await room.getRoomFeature()).dataValues.price ;
      tempRoom.number = room.number ;
      tempRoom.guestsNumber = guestsNumber ;
      tempRoom.cost = cost ;
      finalRooms.push(tempRoom)
    }
    obj.roomsData = finalRooms ;

    reservationInfo.push(obj);

  }
  return reservationInfo;
}


module.exports = reservationsFullInfo;
