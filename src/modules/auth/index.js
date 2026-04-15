// Public API for cross-module model imports — no router here to avoid circular deps
module.exports = {
  User: require("./models/user.model"),
  Otp: require("./models/otp.model"),
  RefreshToken: require("./models/refreshToken.model"),
};
