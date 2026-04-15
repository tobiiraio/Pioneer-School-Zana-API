require("dotenv").config();
const brevo = require("./brevo.provider");
const { renderOtpEmail } = require("./templates/otp.template");
const { renderWelcomeEmail } = require("./templates/welcome.template");

const appName = () => process.env.APP_NAME || "PJSA";

const send = async (toEmail, subject, html) => {
  if (!process.env.BREVO_API_KEY) {
    console.warn("[EmailService] BREVO_API_KEY not set — skipping email send");
    return;
  }
  await brevo.sendEmail({ toEmail, subject, html });
};

const sendOtpEmail = async ({ email, code, ttlMinutes }) => {
  const { subject, html } = renderOtpEmail({ appName: appName(), code, ttlMinutes });
  await send(email, subject, html);
};

const sendWelcomeEmail = async ({ email, name }) => {
  const { subject, html } = renderWelcomeEmail({ appName: appName(), name });
  await send(email, subject, html);
};

module.exports = { sendOtpEmail, sendWelcomeEmail };
