const nodemailer = require('nodemailer');
const twig = require('twig');
const path = require('path');

let transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function renderHTML(template, data) {
  return new Promise((resolve, reject) => {
	twig.renderFile(path.join(__dirname, '../templates/' + template), data, (err, html) => {
	  if (err) {
		reject(err);
	  }
	  resolve(html);
	});
  });
}

async function sendEmail(to, refreshToken) {
  try {
	let subject = 'Matcha : Verify Your Email';
	let html = await renderHTML('mailVerif.twig', { url: process.env.FRONT_URL + '/#/verifyEmail', token: refreshToken});
	console.log('sending email');
    let info = await transporter.sendMail({
      from: '"Matcha Email-Vérif" transcendence-pong@outlook.com',
      to: to,
      subject: subject,
      html: html
    });
	console.log('Message sent: %s', info.messageId);
  } catch (error) {
	  console.error(error);
	throw new Error('Error sending email');
  }
}

async function sendEmailResetPassword(to, refreshToken) {
  try {
  let subject = 'Matcha : Reset Password';
  let html = await renderHTML('passwordForgot.twig', { url: process.env.FRONT_URL + '/#/resetPasswordPage', token: refreshToken, email: to});
  console.log('sending email');
    let info = await transporter.sendMail({
      from: '"Matcha Email-Vérif" transcendence-pong@outlook.com',
      to: to,
      subject: subject,
      html: html
    });
	console.log('Message sent: %s', info.messageId);
  } catch (error) {
	console.error(error);
	throw new Error('Error sending email');
  }
}

module.exports = { sendEmail, sendEmailResetPassword };
