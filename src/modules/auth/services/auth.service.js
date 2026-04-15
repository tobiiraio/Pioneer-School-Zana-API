const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const RefreshToken = require("../models/refreshToken.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../../../notifications/email.service");
require("dotenv").config();

const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES || "10", 10);
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "24h";
const REFRESH_TOKEN_TTL_DAYS = parseInt(process.env.JWT_REFRESH_TTL_DAYS || "30", 10);

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashCode = (code) => crypto.createHash("sha256").update(code).digest("hex");

const issueAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role, subrole: user.subrole || null },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

const issueRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ userId, token, expiresAt });
  return token;
};

exports.registerUser = async ({ name, email, role, subrole }) => {
  if (!name || !email || !role) throw Object.assign(new Error("name, email and role are required"), { status: 400 });
  if (role === "staff" && !subrole) throw Object.assign(new Error("subrole is required for staff members"), { status: 400 });

  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error("User already exists"), { status: 400 });

  const user = new User({ name, email, role, subrole });
  await user.save();

  emailService.sendWelcomeEmail({ email, name }).catch((err) =>
    console.error("[Auth] Welcome email failed:", err.message)
  );

  return user;
};

exports.requestOtp = async (email) => {
  if (!email) throw Object.assign(new Error("email is required"), { status: 400 });

  const user = await User.findOne({ email });
  if (user) {
    await Otp.deleteMany({ email });
    const code = generateCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await Otp.create({ email, code: hashCode(code), expiresAt });
    emailService.sendOtpEmail({ email, code, ttlMinutes: OTP_TTL_MINUTES }).catch((err) =>
      console.error("[Auth] OTP email failed:", err.message)
    );
  }
};

exports.verifyOtp = async (email, code) => {
  if (!email || !code) throw Object.assign(new Error("email and code are required"), { status: 400 });

  const otp = await Otp.findOne({ email, code: hashCode(code) });
  if (!otp) throw Object.assign(new Error("Invalid or expired code"), { status: 400 });

  if (otp.expiresAt < new Date()) {
    await otp.deleteOne();
    throw Object.assign(new Error("Code has expired"), { status: 400 });
  }
  await otp.deleteOne();

  const user = await User.findOne({ email });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  const accessToken = issueAccessToken(user);
  const refreshToken = await issueRefreshToken(user._id);

  return { accessToken, refreshToken, role: user.role, subrole: user.subrole || null };
};

exports.refreshToken = async (refreshToken) => {
  if (!refreshToken) throw Object.assign(new Error("refreshToken is required"), { status: 400 });

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored) throw Object.assign(new Error("Invalid or expired refresh token"), { status: 401 });

  if (stored.expiresAt < new Date()) {
    await stored.deleteOne();
    throw Object.assign(new Error("Refresh token has expired, please log in again"), { status: 401 });
  }

  const user = await User.findById(stored.userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  return { accessToken: issueAccessToken(user) };
};

exports.logout = async (refreshToken) => {
  if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
};
