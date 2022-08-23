const { Client } = require("./models/client");
const { Employee } = require("./models/employee");
const { Hotel } = require("./models/hotel");
const { HotelPhone } = require("./models/hotelPhone");
const { JobTitle } = require("./models/jobTitle");
const { Reservation } = require("./models/reservation");
const { Room } = require("./models/room");
const { RoomFeatures } = require("./models/roomFeature");
const { RoomReserved } = require("./models/roomReserved");
const { RoomStatus } = require("./models/roomStatus");
const { Amenity } = require("./models/amenity");
const { hotelAmenity } = require("./models/hotelAmenity");
const { PaymentMethod } = require("./models/paymentMethod");
const { GuestsName } = require("./models/guestsName");
const { Gallery } = require("./models/gallery");
const { Review } = require("./models/reviews");
const { Service } = require("./models/service");
const { HotelService } = require("./models/hotelService");
const { PaidService } = require("./models/paidServices");
const { HotelPaidService } = require("./models/hotelPaidServices");
const { hotelPaidServicesReserved } = require("./models/hotelPaidServicesReserved");
const { Offer } = require("./models/offers");


// HOTEL :

    // (1) Hotel - Room 
    Hotel.hasMany(Room, { foreignKey: { allowNull: false }});
    Room.belongsTo(Hotel);

    // (2) Hotel - employee  
    Hotel.hasMany(Employee, { foreignKey: { allowNull: true }});
    Employee.belongsTo(Hotel);

    // (3) Hotel - Gallery
    Hotel.hasMany(Gallery, { foreignKey: { allowNull: false }});
    Gallery.belongsTo(Hotel);

    // (4) Hotel - HotelPhone
    Hotel.hasMany(HotelPhone, { foreignKey: { allowNull: false }});
    HotelPhone.belongsTo(Hotel);

    // (5) Hotel - Amenity - through: hotelAmenity
    Hotel.belongsToMany(Amenity, { through: hotelAmenity },);
    Amenity.belongsToMany(Hotel, { through: hotelAmenity });

    // (6) Hotel - Service - through: HotelService
    Hotel.belongsToMany(Service, { through: HotelService },);
    Service.belongsToMany(Hotel, { through: HotelService });

    // (7) Hotel - PaidService - through: HotelPaidService
    Hotel.belongsToMany(PaidService, { through: HotelPaidService },);
    PaidService.belongsToMany(Hotel, { through: HotelPaidService });

    // (8) HotelPaidService - Reservation - through: hotelPaidServicesReserved
    Reservation.HotelPaidService=Reservation.belongsToMany(HotelPaidService, { through: hotelPaidServicesReserved , foreignKey: 'ReservationId'},);
    HotelPaidService.belongsToMany(Reservation, { through: hotelPaidServicesReserved ,foreignKey: 'HotelPaidServiceId'});

    HotelPaidService.hasMany(hotelPaidServicesReserved,{foreignKey: 'HotelPaidServiceId'});
    hotelPaidServicesReserved.belongsTo(HotelPaidService,{foreignKey: 'HotelPaidServiceId'});
    Reservation.hotelPaidServicesReserved =Reservation.hasMany(hotelPaidServicesReserved,{foreignKey: 'ReservationId'});
    hotelPaidServicesReserved.belongsTo(Reservation,{foreignKey: 'ReservationId'});


    // (9) Hotel - reservation
    Hotel.hasMany(Reservation, { foreignKey: { allowNull: false }});
    Reservation.belongsTo(Hotel);

    // (10) Hotel - Review
    Hotel.hasMany(Review, { foreignKey: { allowNull: false }});
    Review.belongsTo(Hotel);

    // (11) Hotel - offer
    Hotel.hasMany(Offer, { foreignKey: { allowNull: false }});
    Offer.belongsTo(Hotel);


// RESERVATION :

    // (12) Reservation - offer
    Offer.hasMany(Reservation, { foreignKey: { allowNull: true }});
    Reservation.belongsTo(Offer);
    
    // (13) Reservation - Review
    Reservation.hasOne(Review,{onDelete: 'cascade'});
    Review.belongsTo(Reservation);

    // (14) reservation - client  
    Client.hasMany(Reservation , { foreignKey: { allowNull: false }} );
    Reservation.belongsTo(Client);

    // (15) reservation - payment method
    PaymentMethod.hasMany(Reservation, { foreignKey: { allowNull: false }});
    Reservation.belongsTo(PaymentMethod);

    // (16) reservation - room 
    Reservation.Room=Reservation.belongsToMany(Room, { through: RoomReserved , foreignKey: 'ReservationId'},);
    Room.belongsToMany(Reservation, { through: RoomReserved ,foreignKey: 'RoomNumber'});

    Room.hasMany(RoomReserved,{foreignKey: 'RoomNumber'});
    RoomReserved.belongsTo(Room,{foreignKey: 'RoomNumber'});
    Reservation.RoomReserved=Reservation.hasMany(RoomReserved,{foreignKey: 'ReservationId'});
    RoomReserved.belongsTo(Reservation,{foreignKey: 'ReservationId'});

    // (17)  RoomReserved - GuestsName
    RoomReserved.GuestsName=RoomReserved.hasMany(GuestsName , {foreignKey: { allowNull:false } } );
    GuestsName.belongsTo(RoomReserved);


// ROOM :

    // (18) Room - RoomFeature
    RoomFeatures.hasMany(Room, { foreignKey: { allowNull: false }});
    Room.belongsTo(RoomFeatures);

    // (19) Room - RoomStatus
    RoomStatus.hasMany(Room, { foreignKey: { allowNull: false }});
    Room.belongsTo(RoomStatus);


// EMPLOYEE :
    // (20) employee - jobTitle 
    JobTitle.hasMany(Employee, { foreignKey: { allowNull: false }});
    Employee.belongsTo(JobTitle);





// Hotel - PaidService - through: HotelPaidService
// Hotel.PaidService=Hotel.belongsToMany(PaidService, { through: HotelPaidService , foreignKey: 'HotelId'},);
// PaidService.belongsToMany(Hotel, { through: HotelPaidService ,foreignKey: 'PaidServiceId'});
// /* ? */
// PaidService.hasMany(HotelPaidService,{foreignKey: 'PaidServiceId'});
// HotelPaidService.belongsTo(PaidService,{foreignKey: 'PaidServiceId'});
// Hotel.HotelPaidService=Hotel.hasMany(HotelPaidService,{foreignKey: 'HotelId'});
// HotelPaidService.belongsTo(Hotel,{foreignKey: 'HotelId'});