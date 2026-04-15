const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../../middlewares/auth.middleware");

const {
  createAssessment, getAssessments, getAssessmentById, getAssessmentsByClass,
  getAssessmentsByTerm, updateAssessment, deleteAssessment,
} = require("./assessment.controller");

const {
  createMark, bulkCreateMarks, getMarksByAssessment, getMarksByStudent,
  updateMark, deleteMark,
} = require("./mark.controller");

const { getStudentReport, getClassReport } = require("./report.controller");

// ── Assessments ────────────────────────────────────────────────────────────────
router.post("/assessments", authenticate, authorizeRole(["admin"]), createAssessment);
router.put("/assessments/:id", authenticate, authorizeRole(["admin"]), updateAssessment);
router.delete("/assessments/:id", authenticate, authorizeRole(["admin"]), deleteAssessment);

router.get("/assessments", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), getAssessments);
router.get("/assessments/class/:classId", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), getAssessmentsByClass);
router.get("/assessments/term/:termId", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), getAssessmentsByTerm);
router.get("/assessments/:id", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), getAssessmentById);

// ── Marks ──────────────────────────────────────────────────────────────────────
router.post("/marks", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), createMark);
router.post("/marks/bulk", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), bulkCreateMarks);

router.get("/marks/assessment/:assessmentId", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), getMarksByAssessment);
router.get("/marks/student/:studentId", authenticate, authorizeRole(["admin", "classteacher"]), getMarksByStudent);

router.put("/marks/:id", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), updateMark);
router.delete("/marks/:id", authenticate, authorizeRole(["admin"]), deleteMark);

// ── Reports ────────────────────────────────────────────────────────────────────
router.get("/reports/student/:studentId/term/:termId", authenticate, authorizeRole(["admin", "classteacher"]), getStudentReport);
router.get("/reports/class/:classId/term/:termId", authenticate, authorizeRole(["admin", "classteacher"]), getClassReport);

module.exports = router;
