const express = require("express");
const router = express.Router();
const {
  createAssessment,
  getAssessments,
  getAssessmentById,
  getAssessmentsByClass,
  getAssessmentsByTerm,
  updateAssessment,
  deleteAssessment,
} = require("../controllers/assessment.controller");
const { authenticate, authorizeRole } = require("../middlewares/auth.middleware");

// Admin only — create, update, delete
router.post("/", authenticate, authorizeRole(["admin"]), createAssessment);
router.put("/:id", authenticate, authorizeRole(["admin"]), updateAssessment);
router.delete("/:id", authenticate, authorizeRole(["admin"]), deleteAssessment);

// Admin + teacher + classteacher — reads
router.get("/", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), getAssessments);
router.get("/class/:classId", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), getAssessmentsByClass);
router.get("/term/:termId", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), getAssessmentsByTerm);
router.get("/:id", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), getAssessmentById);

module.exports = router;
