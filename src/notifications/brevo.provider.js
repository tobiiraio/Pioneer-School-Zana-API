require("dotenv").config();

const sendEmail = async ({ toEmail, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY is not set");

  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!senderEmail) throw new Error("BREVO_SENDER_EMAIL is not set");

  const senderName =
    process.env.BREVO_SENDER_NAME || process.env.APP_NAME || "PJSA";

  const brevoUrl = process.env.BREVO_API_URL || "https://api.brevo.com/v3/smtp/email";

  const response = await fetch(brevoUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: toEmail }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`[Brevo] Error ${response.status}: ${text}`);
    throw new Error("Brevo send failed");
  }
};

module.exports = { sendEmail };
