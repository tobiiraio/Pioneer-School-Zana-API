const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/auth.controller");
const userCtrl = require("../controllers/user.controller");
const { authenticate, authorizeRole } = require("../../../shared/middlewares/auth.middleware");

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/auth/register", authenticate, authorizeRole(["admin"]), authCtrl.register);
router.post("/auth/request-otp", authCtrl.requestOtp);
router.post("/auth/verify-otp", authCtrl.verifyOtp);
router.post("/auth/refresh", authCtrl.refresh);
router.post("/auth/logout", authCtrl.logout);
router.get("/auth/profile", authenticate, authCtrl.profile);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get("/users", authenticate, authorizeRole(["admin"]), userCtrl.getUsers);
router.get("/users/:id", authenticate, userCtrl.getUserById);
router.put("/users/:id", authenticate, userCtrl.updateUser);
router.patch("/users/:id/status", authenticate, authorizeRole(["admin"]), userCtrl.setUserStatus);
router.delete("/users/:id", authenticate, authorizeRole(["admin"]), userCtrl.deleteUser);

module.exports = router;
