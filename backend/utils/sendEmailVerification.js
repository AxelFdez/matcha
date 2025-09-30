const { Resend } = require('resend');
const twig = require('twig');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, refreshToken) {
  try {
	let subject = 'Matcha : Verify Your Email';
	let html = await renderHTML('mailVerif.twig', { url: process.env.FRONT_URL + '/verifyEmailPage', token: refreshToken});
	console.log('sending email');
    const { data, error } = await resend.emails.send({
      from: 'Matcha <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html
    });
    if (error) {
      throw error;
    }
	console.log('Message sent: %s', data.id);
  return data;
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
    const { data, error } = await resend.emails.send({
      from: 'Matcha <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html
    });
    if (error) {
      throw error;
    }
	console.log('Message sent: %s', data.id);
  } catch (error) {
	console.error(error);
	throw new Error('Error sending email');
  }
}

module.exports = { sendEmail, sendEmailResetPassword };
