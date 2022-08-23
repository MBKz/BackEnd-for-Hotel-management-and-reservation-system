const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
const config = require('config');
module.exports =  nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: config.get("gmailAccount.username"),
        pass: config.get("gmailAccount.password")
    }
}));