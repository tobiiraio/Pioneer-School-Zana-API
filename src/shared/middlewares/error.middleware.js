// Central error handler — must be registered last in app.js
// Services throw errors with a `.status` property to control the HTTP status code.
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  if (status === 500) {
    console.error("[Error]", err);
  }

  res.status(status).json({ message });
};
