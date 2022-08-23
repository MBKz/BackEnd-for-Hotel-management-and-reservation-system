const jwt = require('jsonwebtoken')
const config = require('config')
const { Employee } = require('../database/models/employee')
const { JobTitle } = require('../database/models/jobTitle')

module.exports = async function (req, res, next) {
  const token = req.header('auth-token')
  if (!token) return res.status(401).send('Access denied. No token provided.')

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
    if(decoded.jobPriority)
    {
      const employee = await Employee.findByPk(decoded.id);
      if(!employee) return res.status(403).send({message: 'Access denied'})
    }
    
    req.user = decoded
    next()
  } catch (ex) {
    res.status(400).send('Invalid token.')
  }
}
