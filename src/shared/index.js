module.exports = {
  emailService: require("./notifications"),
  errorHandler: require("./middlewares/error.middleware"),
  ...require("./upload"),
};
