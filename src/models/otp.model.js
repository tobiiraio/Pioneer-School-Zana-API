const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL: auto-delete when expiresAt passes
});

module.exports = mongoose.model("Otp", otpSchema);
