const express = require("express");
const router = express.Router();
const { getStudentReport, getClassReport } = require("../controllers/report.controller");
const { authenticate, authorizeRole } = require("../middlewares/auth.middleware");

// Admin + classteacher (scoped to assigned class in controller)
router.get("/student/:studentId/term/:termId", authenticate, authorizeRole(["admin", "classteacher"]), getStudentReport);
router.get("/class/:classId/term/:termId", authenticate, authorizeRole(["admin", "classteacher"]), getClassReport);

module.exports = router;
