const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../../../shared/middlewares/auth.middleware");
const { getAllGrades, createGrade, updateGrade, deleteGrade } = require("../controllers/grade.controller");

router.get("/grades", authenticate, getAllGrades);
router.post("/grades", authenticate, authorizeRole(["admin"]), createGrade);
router.put("/grades/:id", authenticate, authorizeRole(["admin"]), updateGrade);
router.delete("/grades/:id", authenticate, authorizeRole(["admin"]), deleteGrade);

module.exports = router;
