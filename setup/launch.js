const db = require("./db");
require("../database/relations");
require("../database/models/employee");
require("../database/models/jobTitle");
require("../database/models/client");
require("../database/models/reservation");
require("../database/models/hotelPhone");
require("../database/models/hotel");
require("../database/models/roomFeature");
require("../database/models/roomReserved");
require("../database/models/roomStatus");
require("../database/models/room");
require("../database/models/amenity");
require("../database/models/bank");
require("../database/models/paymentMethod");
require("../database/models/notification");

// if (process.env.NODE_ENV == "development")
 // db.sync({ alter: true }).then().catch((err)=>{console.log(err)});
