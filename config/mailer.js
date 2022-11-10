const nodemailer = require('nodemailer');
const sendMail= function(frommail,tomail,output,subject) {

  let transporter = nodemailer.createTransport({
    host: 'mail.zktor.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'admin@zktor.com', // generated ethereal user
        pass: '-s^Od*rY1Ej}'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });
  let mailOptions = {
      from: frommail, // sender address
      to: tomail, // list of receivers
      subject: subject, // Subject line
      //text: 'Hello world?', // plain text body
      html: output // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
      console.log(info);
      if (error) {
          return console.log(error);
      }
  });
}

module.exports = {sendMail};