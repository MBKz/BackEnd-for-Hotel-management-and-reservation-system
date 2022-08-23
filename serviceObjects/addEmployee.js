const { Employee, validateEmployee } = require('../database/models/employee')
const { JobTitle } = require('../database/models/jobTitle')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const { Hotel } = require('../database/models/hotel')


async function addEmployee(body) {

  var response = { employee: '', error: '' }
  // validate
  var employee = _.pick(body, [
    'firstName',
    'lastName',
    'email',
    'password',
    'phone',
  ]);

  const { error } = validateEmployee(employee);
  if (error) { response.error = `Employee's data is invalid: ${error.details[0].message}`; return response }
  // search
  var tempEmployee = await Employee.findOne({ where: { email: body.email } })
  if (tempEmployee) { response.error = `this employee is already exists`; return response }

  //create new object
  const salt = await bcrypt.genSalt(10)
  employee.password = await bcrypt.hash(employee.password, salt)

  // check  the job title
  if (!body.jobTitle) { response.error = `jobTitle is required`; return response }

  const job = await JobTitle.findOne({where: { title: body.jobTitle },});
  if (!job) { response.error = `jobTitle is incorrect`; return response  }
  employee.JobTitleId = job.dataValues.id

  // check the hotel
  if (!body.HotelId) { response.error = `HotelId is required`; return response }
  const hotel = await Hotel.findOne({ where: { id: body.HotelId } })
  if (!hotel) { response.error = `HotelId is incorrect`; return response }
  employee.HotelId = hotel.dataValues.id;

  // add
  employee = await Employee.create(employee);
  response.employee = employee;
  return response;
}

module.exports = addEmployee
