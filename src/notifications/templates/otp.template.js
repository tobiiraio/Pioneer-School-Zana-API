const { renderBaseEmail } = require("./base.template");

const renderOtpEmail = ({ appName, code, ttlMinutes }) => ({
  subject: `${appName} — Your login code`,
  html: renderBaseEmail({
    appName,
    title: "Your login code",
    bodyHtml: `
      <p>Use the code below to sign in to <strong>${appName}</strong>:</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:8px;margin:20px 0;color:#111827;">${code}</div>
      <p>This code expires in <strong>${ttlMinutes} minutes</strong>.</p>
      <p style="color:#6b7280;">If you did not request this code, you can safely ignore this email.</p>
    `,
  }),
});

module.exports = { renderOtpEmail };
