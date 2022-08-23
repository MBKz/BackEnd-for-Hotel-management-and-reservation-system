const express = require('express')
const router = express.Router()
const { Employee, validateEmployee } = require('../database/models/employee')
const auth = require('../middleware/auth')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const addEmployee = require('../serviceObjects/addEmployee')
const { Op } = require('sequelize')
const { JobTitle } = require('../database/models/jobTitle')
const { Hotel } = require('../database/models/hotel')

//profile
router.get("/me", auth, async (req, res) => {
  const me = await Employee.findOne({where: { id: req.user.id } , include: [{model: JobTitle},{model: Hotel}] });
  me.password = ""
  me.jobTitle = me.JobTitle.dataValues.title ;
  if(me.Hotel == null) me.hotel = "You Own All Branches" ;
  else me.hotel = me.Hotel.dataValues.name + ' in ' + me.Hotel.dataValues.city + '-' + me.Hotel.dataValues.location ;
  res
    .status(200)
    .send(
      _.pick(me, ["id", "firstName", "lastName", "email", "password", "phone" , "jobTitle" , "hotel"])
    );
});

// edit profile
router.put("/editProfile", auth, async (req, res) => {
  const me = await Employee.findOne({where: { id: req.user.id } , include: [{model: JobTitle},{model: Hotel}] });
  if(!req.body.oldPassword || !req.body.newPassword) return res.status(400).send({message:`Passwords Are Required !`});

  // check password
  const validPassword = await bcrypt.compare(req.body.oldPassword, me.password);
  if (!validPassword) return res.status(400).send({message:`Invalid Password `});


  me.password = req.body.newPassword;
  const salt = await bcrypt.genSalt(10);
  me.password = await bcrypt.hash(me.password, salt);
  await me.save();

  me.password = ""
  me.title = me.JobTitle.dataValues.title ;
  if(me.Hotel == null) me.hotel = "You Own All Branches" ;
  else me.hotel = me.Hotel.dataValues.name + ' in ' + me.Hotel.dataValues.city + '-' + me.Hotel.dataValues.location ;
  res
    .status(200)
    .send({message: `Profile Edited Successfully .`});

});


// get jobTitle
router.get('/jobTitles' , auth , async(req,res) => {

  const jobs = await JobTitle.findAll({where: { priority: { [Op.gt]: req.user.jobPriority } } } );

  if(!jobs) return res.status(404).send({message:`No Jobs Found !`});
  return res.status(200).send({message:`Okay` ,jobs:jobs})
});

// find employee to fire 
router.get('/:hotelId/:jobId', auth, async (req, res) => {
  

  if (req.params.jobId == 1 ) return res.status(404).send({ message: `Bad Request !` })

  // const me = await Employee.findByPk( req.user.id )
  // if (!me) return res.status(404).send({ message: `You're Not Registered !` });
  
  if (req.user.jobPriority  == req.params.jobId )  return res.status(404).send({ message: `You Have No Access !` });

  // show
  const employees = await Employee.findAll({
    where: {
      HotelId: req.params.hotelId,
      JobTitleId: req.params.jobId,
    },
  }); 
  
  if (!employees || employees.length == 0 ) return res.status(200).send({ message: `There Ars No Employees !`, Employees:[] });
  
  return res.status(200).send({ message: `okay`, Employees: employees });
});

//Add Employee
router.post('/add', auth, async (req, res) => {

  const { employee, error } = await addEmployee(req.body)

  if (error) return res.status(400).send({ message: error })

  res.status(200).send({
    message: 'Okay',
    employee: _.pick(employee, ['firstName', 'lastName', 'email' ]),
  })
});

// delete by id
router.delete('/delete/:id',auth, async (req, res) => {
  
  const employee = await Employee.findByPk(req.params.id);

  if (!employee)  return res.status(404).send({ message: `We Don't Have Such Employee !` });

  const empTitle = await employee.getJobTitle();

  if (empTitle.dataValues.priority <= req.user.jobPriority) return res.status(404).send({ message: `You Have No Access !` });

  await Employee.destroy({ where: { id: req.params.id } });

  res.status(200).send({message: `${employee.dataValues.firstName} is no longer employee`});
});

// add owner
router.post('/addOwner', async (req, res) => {
  var owner = _.pick(req.body, [
    'firstName',
    'lastName',
    'email',
    'password',
    'phone',
  ])

  const { error } = validateEmployee(owner)
  if (error)
    return res
      .status(400)
      .send({
        message: `Employee's data is invalid: ${error.details[0].message}`,
      })

  // search
  var tempOwner = await Employee.findOne({ where: { email: owner.email } })
  if (tempOwner)
    return res.status(400).send({ message: `this owner is already exists` })

  //create new object
  const salt = await bcrypt.genSalt(10)
  owner.password = await bcrypt.hash(owner.password, salt)

  const job = await JobTitle.findOne({ where: { title: 'owner' } })
  if (!job) {
    let job = {}
    job.priority = 1
    job.title = 'owner'
    const newJob = await JobTitle.create(job)
    owner.JobTitleId = newJob.dataValues.id
  } else owner.JobTitleId = job.dataValues.id

  // add
  owner = await Employee.create(owner)
  return res
    .status(200)
    .header('auth-token', owner.getToken())
    .send({ message: 'okay', data: owner })
});

module.exports = router
