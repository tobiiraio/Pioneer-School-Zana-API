const express = require("express");
const { register, requestOtp, verifyOtp, refresh, logout } = require("../controllers/auth.controller");
const { authenticate, authorizeRole } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/register", authenticate, authorizeRole(["admin"]), register);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/profile", authenticate, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

module.exports = router;
