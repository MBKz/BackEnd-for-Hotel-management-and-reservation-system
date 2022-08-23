const express = require("express");
const router = express.Router();
const db = require("../setup/db");

const { Reservation } = require("../database/models/reservation");

const { Op } = require("sequelize");
const { Hotel } = require("../database/models/hotel");
const { HotelPaidService } = require("../database/models/hotelPaidServices");
const {
  hotelPaidServicesReserved,
} = require("../database/models/hotelPaidServicesReserved");
const { PaidService } = require("../database/models/paidServices");

router.get("/average/stay/:hotelId", async (req, res) => {
  var allStays = await Reservation.findAll({
    where: { HotelId: req.params.hotelId },
    attributes: [
      //[db.literal("checkOut - checkIn"), "stay"],
      [db.fn("DATEDIFF", db.col("checkOut"), db.col("checkIn")), "stay"],
    ],
  });
  var avgStay = 0;

  allStays.forEach((element) => {
    avgStay += element.dataValues.stay;
  });

  avgStay = avgStay / allStays.length;

  res.send({
    message: "okay",
    title: "Average length of staying",
    length: avgStay.toFixed(2),
  });
});

router.get("/best/paidService/:hotelId", async (req, res) => {
  try{
    var paidServices = await HotelPaidService.findAll({
      where: {
        HotelId: req.params.hotelId,
      },
      attributes: ["id", "PaidServiceId"],
    });
    var ids = [];
    paidServices.forEach((e) => {
      ids.push(e.id);
    });
    var count = await hotelPaidServicesReserved.findAll({
      where: {
        HotelPaidServiceId: { [Op.in]: ids },
      },
      attributes: [
        "HotelPaidServiceId",
        [db.fn("COUNT", db.col("ReservationId")), "count"],
      ],
      group: ["HotelPaidServiceId"],
    });
    var max = Math.max(
      ...count.map((e) => {
        return e.dataValues.count;
      })
    );
    var p = count.find((e) => e.dataValues.count == max);
  
    var s = await HotelPaidService.findOne({
      where: { id: p.HotelPaidServiceId },
    });
    var f = await PaidService.findByPk(s.dataValues.PaidServiceId);
    res.send({
      message: "okay",
      service: {
        title: "The best service in the current hotel is:",
        name: f.dataValues.name,
        count: max,
      },
    });
  }
  catch(e){
    res.send({
      message: "okay",
      service: {
        title: "The most wanted :",
        name: 'no service ',
        count: 0,
      },
    });
  }
 
});

router.get("/reservations/count/:start/:end/:hotelId", async (req, res) => {
 
  var onlineReservation = await Reservation.findAll({
    attributes: ["reservationDate", [db.fn("COUNT", db.col("id")), "value"]],
    where: {
      HotelId: req.params.hotelId,
      reservationDate: { [Op.between]: [req.params.start, req.params.end] },
      online: 1,
    },
    group: ["reservationDate"],
  });
  onlineReservation.forEach((e) => {
    e.dataValues.value = e.dataValues.value.toFixed(2);
  });
  var offlineReservation = await Reservation.findAll({
    attributes: ["reservationDate", [db.fn("COUNT", db.col("id")), "value"]],
    where: {
      HotelId: req.params.hotelId,
      reservationDate: { [Op.between]: [req.params.start, req.params.end] },
      online: 0,
    },
    group: ["reservationDate"],
  });
  offlineReservation.forEach((e) => {
    e.dataValues.value = e.dataValues.value.toFixed(2);
  });
  var response = {
    message: "okay",
    title: "number of client VS reception reservations",
    line1: {
      name: "online",
      values: onlineReservation,
    },
    line2: {
      name: "offline",
      values: offlineReservation,
    },
  };
  res.status(200).send(response);
});

router.get("/reservations/cost/:start/:end/:hotelId", async (req, res) => {
  var onlineReservation = await Reservation.findAll({
    attributes: ["reservationDate", [db.fn("sum", db.col("cost")), "value"]],
    where: {
      HotelId: req.params.hotelId,
      reservationDate: { [Op.between]: [req.params.start, req.params.end] },
      online: 1,
    },
    group: ["reservationDate"],
  });
  var offlineReservation = await Reservation.findAll({
    attributes: ["reservationDate", [db.fn("sum", db.col("cost")), "value"]],
    where: {
      HotelId: req.params.hotelId,
      reservationDate: { [Op.between]: [req.params.start, req.params.end] },
      online: 0,
    },
    group: ["reservationDate"],
  });
  var response = {
    message: "okay",
    title: "profits of client VS reception reservations",
    line1: {
      name: "online",
      values: onlineReservation,
    },
    line2: {
      name: "offline",
      values: offlineReservation,
    },
  };
  res.status(200).send(response);
});

module.exports = router;
