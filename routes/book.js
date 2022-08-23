const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const _ = require("lodash");
const { Reservation } = require("../database/models/reservation");
const { RoomReserved } = require("../database/models/roomReserved");
const { HotelPaidService } = require("../database/models/hotelPaidServices");
const { hotelPaidServicesReserved } = require("../database/models/hotelPaidServicesReserved");
const { Offer } = require("../database/models/offers");
const { Client } = require("../database/models/client");
const { Bank, validateBank } = require("../database/models/bank");
const { getAvailableRooms ,getReservedRooms } = require("../serviceObjects/getRooms");
const addClient = require("../serviceObjects/addClient");
const { Room } = require("../database/models/room");
const { Hotel } = require("../database/models/hotel");
const db = require("../setup/db");
const { Op } = require("sequelize");
const { func } = require("joi");
// schedule the 'reserved' state on check in
// schedule the 'available' state on check out

// get available rooms
// not working
router.put("/availableRooms", auth, async (req, res) => {
  let unAvailableRooms = [],
    availableRooms = [];
  // get available rooms between 2 dates and capacity
  for (i = 0; i < req.body.rooms.length; i++) {
    let tempRooms = await getAvailableRooms(
      req.body.hotelId,
      req.body.checkIn,
      req.body.checkOut,
      req.body.rooms[i]
    );
    if (tempRooms.length === 0) unAvailableRooms.push(i + 1);
    else availableRooms.push(tempRooms);
  }
  // find out if one of requested rooms doesn't have suitable available rooms
  if (unAvailableRooms.length != 0)
    return res.status(404).send({
      message: `couldn't find suitable room for the room number ${unAvailableRooms} in your rooms list !`,
      rooms: [],
    });
  // send array of available rooms array
  else return res.status(200).send({ message: "okay", rooms: availableRooms });
});

// lock a room
router.put("/lockRoom/:roomNumber", auth, async (req, res) => {
  const room = await Room.findOne({ where: { number: req.params.roomNumber } });
  if(!room) return res.status(404).send({message:`Invalid Room Number !`});
  room.locked = true;
  await room.save();
  return res
    .status(200)
    .send({ message: `room number: ${req.params.roomNumber} is locked .` });
});

// get services
router.get("/paidServices/:hotelId" , async (req, res) => {

  const hotel = await Hotel.findByPk(req.params.hotelId);

  if (!hotel)   return res.status(404).send({message: "incorrect hotel id"});

  var paidServices = await hotel.getPaidServices();

  if(!paidServices || paidServices.length == 0) return res.status(404).send({message:`There Is No Paid Services`});

  for (const one of paidServices) {
    one.useId = one.HotelPaidService.id
  }
  paidServices = paidServices.map( ({id,name,cost,useId}) => ({id,name,cost,useId}) );

  return res.status(200).send({message:`OK` , paidServices:paidServices});
});

// apply Offer
router.put("/applyOffer/:hotelId" ,auth, async(req,res) => {

  if(!req.body.cost) return res.status(400).send({message: `cost is required !`});
  const now = new Date().toDateString();
  const offer = await Offer.findOne(
    {where: 
      {
        isValid: true ,
        HotelId: req.params.hotelId ,
        startDate: { [Op.lte]: now } ,
        endDate:  { [Op.gte]: now }
      } 
    });
 
  if(!offer) return res.status(404).send({message:`There is No Offers` }) ;
 
  const discount = offer.dataValues.discount;
 
  var newCost =((req.body.cost*1) - ((req.body.cost*1) * discount)).toFixed(2);
 
  return res.status(200).send({message:`Offer Applied` , cost:newCost , OfferId: offer.dataValues.id   ,discount: discount });
});

// pay from bank account
router.put("/pay", auth, async (req, res) => {
  // validate
  if (!req.body.accountNumber || !req.body.cost) return res.status(400).send({ message: "Bank Account's And Cost Are Required !" });
  // search
  const bank = await Bank.findOne({where: { accountNumber: req.body.accountNumber },});
  if (!bank)  return res.status(404).send({ message: "Bank Account doesn't Exist !" });
  // pay
  if ( (bank.budget*1) < (req.body.cost*1) ) return res.status(404).send({message: "Oops! There Is No Enough Mony In Your Account !",});
  bank.budget = (bank.budget*1) - (req.body.cost*1);
  await bank.save();
  return res.status(200).send({ message: "The Bill Has Been Paid ." });
});

// cancel booking request
router.put("/cancelBook", auth, async (req, res) => {
  
  if(req.body.hasPaid == false) {
    req.body.rooms.forEach(async (roomNumber) => {
      const room = await Room.findOne({ where: { number: roomNumber } });
      room.locked = false;
      await room.save();
    });
    return res.status(200).send({message: `reservation canceled and the rooms ${req.body.rooms} is available now .`,});
  }

  if(req.body.hasPaid == true){
    // free rooms
    req.body.rooms.forEach(async (roomNumber) => {
      const room = await Room.findOne({ where: { number: roomNumber } });
      room.locked = false;
      await room.save();
    });
    // pay back
    const account = await Bank.findOne({where: {accountNumber: req.body.accountNumber}});
    if(!account) return res.status(404).send({message: `There Is No Such Account Number !`});
    account.budget = (account.budget*1) +(req.body.cost*1);
    await account.save();
    return res.status(200).send({message: `reservation canceled and the rooms ${req.body.rooms} is available now .`,});
  }
  return res.status(400).send({message:`hasPaid is required !`});
});

// confirm booking request
router.post("/confirmBook", auth, async (req, res) => {

  console.log(req.body);
  let resObj = new Reservation();
  let clientObj = new Client();
  // add client

  console.log(req.body.reservation.HotelPaidServicesReserveds);
  clientObj = _.pick(req.body.client, [
    "firstName",
    "lastName",
    "email",
    "password",
    "phone",

  ]);
  var me = await Client.findByPk(req.user.id);
  if(me) req.body.reservation.onLine =true
  try {
    const result = await db.transaction(async (t) => {
      // search by email
      const { client, error } = await addClient(clientObj, true);
      if (error)
        return res.status(400).send({
          message: ` [${error}] please try again`,
        });
        // create reservation
      resObj = req.body.reservation;
      resObj.ClientId = client.id;
      const resTemp = await Reservation.create(
        resObj,
        {
          include: [
            {
              association: Reservation.RoomReserved,
              include: [RoomReserved.GuestsName],
            },
            {
              association: Reservation.hotelPaidServicesReserved,
            }
          ],
        },
        { transaction: t }
      );

      // free from lock
      const freeRooms = await resTemp.getRooms();
      freeRooms.forEach(async (one) => {
        one.locked = false;
        await one.save();
      });
      return res.status(200).send({
        message: `The reservation is done successfully`,
        reservationId: resTemp.id,
      });
    });
  } catch (error) {
    console.log(`[${error}] `);
    return res
      .status(400)
      .send({ message: `Oops +_+ something went wrong , please try again` });
  }
});


async function checkOffer (diff ,id){
  let offer = 0 ;
  if(id != null) {
    console.log(2.1);
    const offerInfo = await Offer.findByPk(id);
    offer =offerInfo.dataValues.discount; 
  }
  let result = diff - (diff*offer)
  console.log({result: result});
  return result;
}

// confirm editing
router.put("/editBook/:id", auth, async (req, res) => {
  console.log(req.body);
  try {
    const result = await db.transaction(async (t) => {
      // search
      let reservation = await Reservation.findOne({where: { id: req.params.id },});
      if (!reservation) return res.status(404).send({ message: "There Is No Such Reservation !" });

      // edit by rooms
      if (req.body.toUpdate == "room") {
        if(!req.body.PaymentMethodId || !req.body.room ) return res.status(400).send({ message: `Invalid Or Missing Data [PaymentMethod ,room] !` });
        const roomRes = await RoomReserved.findOne({where: { ReservationId: req.params.id, RoomNumber: req.body.room.oldRoom }});
        if(!roomRes) return res.status(404).send({message: `Invalid Old Room Number !`});
        // deal with bank and cost and rooms
       // if(!aRooms.includes(req.body.room.newRoom))return res.status(400).send({message:`this Room Is Not Available At This Date !`});

        if(req.body.PaymentMethodId === 1) {
          if (req.body.difference == null  || !req.body.accountNumber ) return res.status(400).send({ message: `Invalid Or Missing Data [difference ,accountNumber] !` });
          if(req.body.difference != 0){
            req.body.difference = await checkOffer( (req.body.difference*1) , req.body.OfferId);
            // bank
            let account = await Bank.findOne({where: {accountNumber: req.body.accountNumber}});
            if(!account)  return res.status(404).send({ message: `Invalid Bank Account Number!` });
            account.budget = (account.budget*1) + ((req.body.difference*1)*-1);
            if((account.budget*1) < 0) return res.status(404).send({ message: `No Enough Money !` });
            await account.save({transaction: t});
            // reservation
            await Reservation.update({ cost: (reservation.cost*1) + (req.body.difference*1) },{ where: { id: req.params.id }, transaction: t });
          }
          // roomReserved
          await RoomReserved.update(
            { RoomNumber: req.body.room.newRoom },{where: { ReservationId: req.params.id, RoomNumber: req.body.room.oldRoom }
            ,transaction: t});
            return res.status(200).send({message: `Your Reservation Updated Successfully , Id: ${req.params.id}`,});
        }

        if(req.body.PaymentMethodId === 2) {
          if (req.body.difference == null  || !req.body.room ) return res.status(400).send({ message: `Invalid Or Missing Data [difference ,room]!` });
          // reservation
          req.body.difference = await checkOffer( req.body.difference*1 ,req.body.offerId );
          await Reservation.update({ cost: (reservation.cost*1) + (req.body.difference*1) },{ where: { id: req.params.id }, transaction: t });
          

          // roomReserved
          await RoomReserved.update(
            { RoomNumber: req.body.room.newRoom },{where: { ReservationId: req.params.id, RoomNumber: req.body.room.oldRoom }
            ,transaction: t});
            return res.status(200).send({message: `Your Reservation Updated Successfully , Id: ${req.params.id} With Difference ${req.body.difference }`,});
        }
        else return res.status(400).send({ message: `Invalid PaymentMethod  !` });
      }

      // edit by date
      if (req.body.toUpdate == "dates") {
        if (!req.body.checkIn || !req.body.checkOut || !req.body.room)  return res.status(400).send({ message: `Invalid Or Missing Dates !` });
        // check availability

        const ReservedRooms = await getReservedRooms(reservation.dataValues.HotelId,req.body.checkIn,req.body.checkOut);
        var rRooms = [];
        console.log(ReservedRooms);
        ReservedRooms.forEach(element => {
          rRooms.push(element.RoomNumber)
        });
        console.log(rRooms);
        if( !rRooms.length == 0) 
        {
          var currentRooms = await reservation.getRoomReserveds();
          currentRooms.forEach((room)=>{
            console.log(room);
           if(rRooms.includes(room.dataValues.RoomNumber)) return res.status(400).send({message:`Your Rooms Is Not Available At This Date !`});
          })
        } 
       
     
        // update reservation
        await Reservation.update(
          { checkIn: req.body.checkIn, checkOut: req.body.checkOut },
          { where: { id: req.params.id }, transaction: t }
        );
        return res.status(200).send({message: `Your Reservation Updated Successfully , Id: ${req.params.id}`,});
      }

      // edit by services
      if (req.body.toUpdate == "services") {
        if (req.body.hotelPaidServices == null)  return res.status(400).send({ message: `Invalid Or Missing Hotel Paid Services !` });
        //  delete services
        if(req.body.hotelPaidServices.length == 0){
          let services = await reservation.getHotelPaidServicesReserveds();
          if(services.length != 0) await hotelPaidServicesReserved.destroy({where:{ ReservationId: req.params.id  }, transaction: t });
          if(req.body.difference != 0){
            if(req.body.PaymentMethodId === 1){
            req.body.difference = await checkOffer( req.body.difference*1 ,req.body.offerId );
            // bank
            let account = await Bank.findOne({where: {accountNumber: req.body.accountNumber}});
            if(!account)  return res.status(404).send({ message: `Invalid Bank Account Number!` });
            account.budget = (account.budget*1) + ((req.body.difference*1)*-1);
            if(account.budget < 0) return res.status(404).send({ message: `No Enough Money !` });
            await account.save({transaction: t});
            // reservation
            await Reservation.update({ cost: (reservation.cost*1) + (req.body.difference*1) },{ where: { id: req.params.id }, transaction: t });
          }
          if(req.body.PaymentMethodId === 2){
            req.body.difference = await checkOffer( req.body.difference*1 ,req.body.offerId );
            // reservation
            await Reservation.update({ cost: (reservation.cost*1) + (req.body.difference*1) },{ where: { id: req.params.id }, transaction: t });
          }
        }
        }
        // edit services
        else {
          let services = await reservation.getHotelPaidServicesReserveds();
          if(services.length != 0) await hotelPaidServicesReserved.destroy({where:{ ReservationId: req.params.id  }, transaction: t });
          for (const serviceId of req.body.hotelPaidServices) {
            let hotelPaidService = await HotelPaidService.findOne({ where: { PaidServiceId: serviceId } });
            hotelPaidService = hotelPaidService.dataValues.id
            await hotelPaidServicesReserved.create({HotelPaidServiceId: hotelPaidService , ReservationId: req.params.id },{ transaction: t });
          }
          if(req.body.difference != 0){
            if(req.body.PaymentMethodId === 1){
            req.body.difference = await checkOffer( req.body.difference*1 , req.body.offerId);
            // bank
            let account = await Bank.findOne({where: {accountNumber: req.body.accountNumber}});
            if(!account)  return res.status(404).send({ message: `Invalid Bank Account Number!` });
            account.budget = (account.budget*1) + ((req.body.difference*1)*-1);
            if(account.budget < 0) return res.status(404).send({ message: `No Enough Money !` });
            await account.save({transaction: t});
            // reservation
            await Reservation.update({ cost: (reservation.cost*1) + req.body.difference },{ where: { id: req.params.id }, transaction: t });
          }
          if(req.body.PaymentMethodId === 2){
            req.body.difference = await checkOffer( req.body.difference*1 , req.body.offerId);
            // reservation
            await Reservation.update({ cost: (reservation.cost*1) + req.body.difference },{ where: { id: req.params.id }, transaction: t });
          }
        }
        }
        return res.status(200).send({message: `Your Reservation Updated Successfully , Id: ${req.params.id} With Difference ${req.body.difference }`,});
      }

      else return res.status(400).send({ message: `toUpdate Is Invalid !` });
    });
  } catch (error) {
    console.log(`[${error}] `);
    return res.status(400).send({ message: `Oops +_+ something went wrong , please try again` });
  }
});

// delete ability
router.get("/deleteAbility/:id", auth, async (req, res) => {
  let today = new Date().toDateString();

  
  const reservation = await Reservation.findOne({
    where: { id: req.params.id },
  });

  if (!reservation)
    return res.status(404).send({ message: "There Is No Such Reservation !" });

  if (new Date(reservation.dataValues.reservationDate).toDateString() == today)
    res.status(200).send({
      message:
        "if you delete your reservation , we will cut 0% of your bill (~_~)",
    });
  else {
    if (new Date(reservation.dataValues.checkIn).toDateString() > today)
      res.status(200).send({
        message:
          "if you delete your reservation , we will cut 30% of your bill (~_~)",
      });

    if (new Date(reservation.dataValues.checkIn).toDateString() <= today)
      res.status(200).send({
        message:
          "You Can't Delete Your Reservation ! , If You Do So You'll Not Get Any Pay Back ! (~_~)",
      });
  }
});

// confirm Delete
router.delete("/confirmDelete/:id", auth, async (req, res) => {

  let today = new Date().toDateString();

  const reservation = await Reservation.findOne({
    where: { id: req.params.id },
  });

  if (!reservation) return res.status(404).send({ message: "There Is No Such Reservation !" });

  if ( new Date(reservation.dataValues.reservationDate).toDateString() == today) {
    // cut 0 %
    if (reservation.dataValues.PaymentMethodId == 1) {
      const bankAccount = await Bank.findOne({
        where: { accountNumber: reservation.dataValues.accountNumber },
      });
      if (!bankAccount) return res.status(404).send({ message: "There Is No Such bankAccount !" });
      bankAccount.budget = (bankAccount.budget*1) + (reservation.dataValues.cost*1);
      await bankAccount.save();
    }
  } 
  else {
    if (new Date(reservation.dataValues.checkIn).toDateString() > today) {
      // cut 30 %
      if (reservation.dataValues.PaymentMethodId == 1) {
        const bankAccount = await Bank.findOne({
          where: { accountNumber: reservation.dataValues.accountNumber },
        });
        if (!bankAccount) return res.status(404).send({ message: "There Is No Such bankAccount !" });
        bankAccount.budget = (bankAccount.budget*1) + ( (reservation.dataValues.cost*1) * 0.7);
        await bankAccount.save();
      }
    }
  }

  await Reservation.destroy({ where: { id: req.params.id } });

  return res.status(200).send({
    message: `Reservation With ID: ${req.params.id} Has Been Deleted ...`,
  });
});

module.exports = router;
