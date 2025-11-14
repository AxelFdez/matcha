const brevo = require("@getbrevo/brevo");
const twig = require("twig");
const path = require("path");

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

async function renderHTML(template, data) {
  return new Promise((resolve, reject) => {
    twig.renderFile(path.join(__dirname, "../templates", template), data, (err, html) => {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
}

async function sendEmail(to, refreshToken) {
  try {
    let subject = "Matcha : Vérification de votre email";
    let html = await renderHTML("mailVerif.twig", {
      url: process.env.FRONT_URL + "/VerifyEmailPage",
      token: refreshToken,
    });
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: "Matcha", email: "axesnake06@gmail.com" };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    // console.log("Verification email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending email");
  }
}

async function sendEmailResetPassword(to, refreshToken) {
  try {
    let subject = "Matcha : Réinitialisation de votre mot de passe";
    let html = await renderHTML("passwordForgot.twig", {
      url: process.env.FRONT_URL + "/ResetPasswordPage",
      token: refreshToken,
      email: to,
    });
    console.log("Sending password reset email to:", to);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: "Matcha", email: "axesnake06@gmail.com" };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Password reset email sent successfully:", data.messageId);
    return data;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Error sending email");
  }
}

module.exports = { sendEmail, sendEmailResetPassword, renderHTML };
