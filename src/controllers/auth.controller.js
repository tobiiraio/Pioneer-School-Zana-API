const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const RefreshToken = require("../models/refreshToken.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../notifications/email.service");
require("dotenv").config();

const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES || "10", 10);
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "24h";
const REFRESH_TOKEN_TTL_DAYS = parseInt(process.env.JWT_REFRESH_TTL_DAYS || "30", 10);

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const hashCode = (code) =>
  crypto.createHash("sha256").update(code).digest("hex");

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

// POST /auth/register  (admin only)
exports.register = async (req, res) => {
  try {
    const { name, email, role, subrole } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "name, email and role are required" });
    }

    if (role === "staff" && !subrole) {
      return res.status(400).json({ message: "subrole is required for staff members" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, role, subrole });
    await user.save();

    emailService.sendWelcomeEmail({ email, name }).catch((err) =>
      console.error("[Auth] Welcome email failed:", err.message)
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /auth/request-otp  { email }
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });

    const user = await User.findOne({ email });

    // Always respond the same way — don't reveal whether email is registered
    if (user) {
      await Otp.deleteMany({ email });

      const code = generateCode();
      const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
      await Otp.create({ email, code: hashCode(code), expiresAt });

      emailService.sendOtpEmail({ email, code, ttlMinutes: OTP_TTL_MINUTES }).catch((err) =>
        console.error("[Auth] OTP email failed:", err.message)
      );
    }

    res.json({ message: "If an account exists for this email, a login code has been sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /auth/verify-otp  { email, code }
exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "email and code are required" });
    }

    const otp = await Otp.findOne({ email, code: hashCode(code) });
    if (!otp) return res.status(400).json({ message: "Invalid or expired code" });

    if (otp.expiresAt < new Date()) {
      await otp.deleteOne();
      return res.status(400).json({ message: "Code has expired" });
    }

    await otp.deleteOne();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const accessToken = issueAccessToken(user);
    const refreshToken = await issueRefreshToken(user._id);

    res.json({
      accessToken,
      refreshToken,
      role: user.role,
      subrole: user.subrole || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /auth/refresh  { refreshToken }
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken is required" });

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) return res.status(401).json({ message: "Invalid or expired refresh token" });

    if (stored.expiresAt < new Date()) {
      await stored.deleteOne();
      return res.status(401).json({ message: "Refresh token has expired, please log in again" });
    }

    const user = await User.findById(stored.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const accessToken = issueAccessToken(user);

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /auth/logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
