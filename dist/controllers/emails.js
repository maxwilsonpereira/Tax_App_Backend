"use strict";
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11954404
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
// npm install --save nodemailer nodemailer-sendgrid-transport
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
// CONTROLLER FOLDER (BACKEND):
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SEND_GRID_API,
    },
}));
// SENDING MAILS:
const sendEmail = async (req, res, next) => {
    const name = req.body.name;
    const telephone = req.body.telephone;
    const email = req.body.email;
    const message = req.body.message;
    transporter
        .sendMail({
        to: 'maxwilsonpereira@gmail.com',
        from: 'maxallerlei01@gmail.com',
        subject: 'Declaração de IR - Mensagem',
        // html: "<h1>You successfully signed up!</h1>"
        html: '<div><h3>From: <b>' +
            name +
            '</b><br />Email: <b>' +
            email +
            '</b><br />Telephone: <b>' +
            telephone +
            '</b><br />Message: <b>' +
            message +
            '</b><br /><br /></h3></div>',
    })
        .then(() => {
        // 200: OK
        return res.status(200).json({
            message: 'Mensagem enviada!',
        });
    })
        .catch((err) => {
        // console.log(err);
        console.log(err.message);
        // 500: Not Found
        return res.status(500).json({
            message: 'Internal server error!',
        });
    });
};
exports.sendEmail = sendEmail;
