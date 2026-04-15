const express = require("express");
const router = express.Router();
const {
  createMark,
  bulkCreateMarks,
  getMarksByAssessment,
  getMarksByStudent,
  updateMark,
  deleteMark,
} = require("../controllers/mark.controller");
const { authenticate, authorizeRole } = require("../middlewares/auth.middleware");

// Admin + teacher + classteacher — submit marks (controller enforces class/subject scope)
router.post("/", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), createMark);
router.post("/bulk", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), bulkCreateMarks);

// Read marks by assessment — admin + teacher (own) + classteacher
router.get("/assessment/:assessmentId", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), getMarksByAssessment);

// Read marks by student — admin + classteacher only
router.get("/student/:studentId", authenticate, authorizeRole(["admin", "classteacher"]), getMarksByStudent);

// Update — admin + teacher who entered the mark (controller enforces ownership)
router.put("/:id", authenticate, authorizeRole(["admin", "teacher", "classteacher"]), updateMark);

// Delete — admin only
router.delete("/:id", authenticate, authorizeRole(["admin"]), deleteMark);

module.exports = router;
