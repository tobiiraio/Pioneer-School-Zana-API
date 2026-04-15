const express = require("express");
const { getUsers, getUserById, updateUser, deleteUser, setUserStatus } = require("../controllers/user.controller");
const { authenticate, authorizeRole } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authenticate, authorizeRole(["admin"]), getUsers);
router.get("/:id", authenticate, getUserById);
router.put("/:id", authenticate, updateUser);
router.patch("/:id/status", authenticate, authorizeRole(["admin"]), setUserStatus);
router.delete("/:id", authenticate, authorizeRole(["admin"]), deleteUser);

module.exports = router;
