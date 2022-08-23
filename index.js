const express = require("express");
const app = express();
app.use(express.json());

// Errors - winston
require("./setup/logging");
const error = require("./middleware/error");
//db
require("./setup/launch");
//routes
const employees = require("./routes/employees");
const clients = require("./routes/clients");
const amenities = require("./routes/amenities");
const auth = require("./routes/auth");
const book = require("./routes/book");
const reservations = require("./routes/reservations");
const manage = require("./routes/manage");
const reviews = require("./routes/reviews");
const gallery = require("./routes/gallery");
const services = require("./routes/services");
const vault = require("./routes/vault");
const config = require("config");
const offers = require("./routes/offers");
const paidServices = require("./routes/paidServices");
const branches = require("./routes/hotelBranches");
const reports =  require("./routes/reports");
const notifications =  require("./routes/notifications");
path = require("path");
if (!config.get("jwtPrivateKey"))
  throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");

const hotelName = config.get("hotelName");

app.use(
  `/api/${hotelName}/images`,
  express.static(path.join(__dirname, "images"))
);
app.use(`/api/${hotelName}/employees`, employees);
app.use(`/api/${hotelName}/clients`, clients);
app.use(`/api/${hotelName}/amenities`, amenities);
app.use(`/api/${hotelName}/auth`, auth);
app.use(`/api/${hotelName}/book`, book);
app.use(`/api/${hotelName}/reservations`, reservations);
app.use(`/api/${hotelName}/manage`, manage);
app.use(`/api/${hotelName}/reviews`, reviews);
app.use(`/api/${hotelName}/gallery`, gallery);
app.use(`/api/${hotelName}/services`, services);
app.use(`/api/${hotelName}/vault`, vault);
app.use(`/api/${hotelName}/branches`, branches);
app.use(`/api/${hotelName}/offers`, offers);
app.use(`/api/${hotelName}/paidServices`, paidServices);
app.use(`/api/${hotelName}/reports`, reports);
app.use(`/api/${hotelName}/notifications`, notifications);

//errors
app.use(error);

// listen
const port = process.env.PORT || 3000;
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`listening to port ${port}`)
);



// const { Reservation } = require("./database/models/reservation");
// const { RoomReserved } = require("./database/models/roomReserved");
// const { hotelPaidServicesReserved } = require("./database/models/hotelPaidServicesReserved");
// async function run(){
//   const rr = await Reservation.findOne({where: {id: 31} , include:[{model:RoomReserved},{model:hotelPaidServicesReserved}]});
//   console.log(rr);
// }

// run();




