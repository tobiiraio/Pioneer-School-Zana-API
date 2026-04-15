const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    await authService.registerUser(req.body);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) { next(err); }
};

exports.requestOtp = async (req, res, next) => {
  try {
    await authService.requestOtp(req.body.email);
    res.json({ message: "If an account exists for this email, a login code has been sent" });
  } catch (err) { next(err); }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyOtp(req.body.email, req.body.code);
    res.json(result);
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);
    res.json(result);
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.json({ message: "Logged out successfully" });
  } catch (err) { next(err); }
};

exports.profile = (req, res) => {
  res.json({ message: "Access granted", user: req.user });
};
