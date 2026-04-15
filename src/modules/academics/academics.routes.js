const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../../middlewares/auth.middleware");

const {
  createAcademicYear,
  getAllAcademicYears,
  getAcademicYearById,
  updateAcademicYear,
  deleteAcademicYear,
} = require("./academicYear.controller");

const {
  createAcademicTerm,
  getAllAcademicTerms,
  getAcademicTermById,
  updateAcademicTerm,
  deleteAcademicTerm,
} = require("./academicTerm.controller");

const {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
} = require("./class.controller");

const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("./subject.controller");

const allStaff = ["admin", "teacher", "classteacher", "bursar", "non-teaching"];

// ── Academic Years ─────────────────────────────────────────────────────────────
router.post("/academic-years", authenticate, authorizeRole(["admin"]), createAcademicYear);
router.get("/academic-years", authenticate, authorizeRole(allStaff), getAllAcademicYears);
router.get("/academic-years/:id", authenticate, authorizeRole(allStaff), getAcademicYearById);
router.put("/academic-years/:id", authenticate, authorizeRole(["admin"]), updateAcademicYear);
router.delete("/academic-years/:id", authenticate, authorizeRole(["admin"]), deleteAcademicYear);

// ── Academic Terms ─────────────────────────────────────────────────────────────
router.post("/academic-terms", authenticate, authorizeRole(["admin"]), createAcademicTerm);
router.get("/academic-terms", authenticate, authorizeRole(allStaff), getAllAcademicTerms);
router.get("/academic-terms/:id", authenticate, authorizeRole(allStaff), getAcademicTermById);
router.put("/academic-terms/:id", authenticate, authorizeRole(["admin"]), updateAcademicTerm);
router.delete("/academic-terms/:id", authenticate, authorizeRole(["admin"]), deleteAcademicTerm);

// ── Classes ────────────────────────────────────────────────────────────────────
router.post("/classes", authenticate, authorizeRole(["admin"]), createClass);
router.get("/classes", authenticate, authorizeRole(allStaff), getAllClasses);
router.get("/classes/:id", authenticate, authorizeRole(allStaff), getClassById);
router.put("/classes/:id", authenticate, authorizeRole(["admin"]), updateClass);
router.delete("/classes/:id", authenticate, authorizeRole(["admin"]), deleteClass);

// ── Subjects ───────────────────────────────────────────────────────────────────
router.post("/subjects", authenticate, authorizeRole(["admin"]), createSubject);
router.get("/subjects", authenticate, authorizeRole(allStaff), getAllSubjects);
router.get("/subjects/:id", authenticate, authorizeRole(allStaff), getSubjectById);
router.put("/subjects/:id", authenticate, authorizeRole(["admin"]), updateSubject);
router.delete("/subjects/:id", authenticate, authorizeRole(["admin"]), deleteSubject);

module.exports = router;
