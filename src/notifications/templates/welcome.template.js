const { renderBaseEmail } = require("./base.template");

const renderWelcomeEmail = ({ appName, name }) => ({
  subject: `Welcome to ${appName}`,
  html: renderBaseEmail({
    appName,
    title: `Welcome, ${name}!`,
    bodyHtml: `
      <p>Your account has been created on <strong>${appName}</strong>.</p>
      <p>To sign in, simply request a login code using your email address — no password needed.</p>
      <p style="color:#6b7280;">If you did not expect this account, please contact the school administration.</p>
    `,
  }),
});

module.exports = { renderWelcomeEmail };
