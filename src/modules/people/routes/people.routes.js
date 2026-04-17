const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../../../shared/middlewares/auth.middleware");
const { upload } = require("../../../shared/upload");

const {
  createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent,
  addParentToStudent, removeParentFromStudent, getStudentsByClass, getStudentsByStatus,
  updatePrimaryContact, createStudentWithAccount, uploadStudentPhoto,
} = require("../controllers/student.controller");

const {
  createStaff, getAllStaff, getStaffById, updateStaff, deleteStaff,
  getStaffByDepartment, getStaffByStatus, setStaffStatus,
  addSubjectToTeacher, removeSubjectFromTeacher, addClassToTeacher, removeClassFromTeacher,
  createStaffWithAccount, getTeachersBySubject, getTeachersByClass,
  uploadStaffPhoto, uploadStaffIdDocument,
} = require("../controllers/staff.controller");

const {
  createParent, getAllParents, getParentById, updateParent, deleteParent,
  addStudentToParent, removeStudentFromParent, getParentsByStudentId, createParentWithAccount,
  uploadParentPhoto, uploadParentIdDocument,
} = require("../controllers/parent.controller");

// ── Students ───────────────────────────────────────────────────────────────────
router.patch("/students/:id/photo", authenticate, authorizeRole(["admin"]), upload.single("photo"), uploadStudentPhoto);
router.post("/students", authenticate, authorizeRole(["admin"]), createStudent);
router.put("/students/:id", authenticate, authorizeRole(["admin"]), updateStudent);
router.delete("/students/:id", authenticate, authorizeRole(["admin"]), deleteStudent);
router.post("/students/add-parent", authenticate, authorizeRole(["admin"]), addParentToStudent);
router.delete("/students/:studentId/parent/:parentId", authenticate, authorizeRole(["admin"]), removeParentFromStudent);
router.put("/students/primary-contact", authenticate, authorizeRole(["admin"]), updatePrimaryContact);
router.post("/students/with-account", authenticate, authorizeRole(["admin"]), createStudentWithAccount);

router.get("/students", authenticate, authorizeRole(["admin", "bursar"]), getAllStudents);
router.get("/students/status/:status", authenticate, authorizeRole(["admin"]), getStudentsByStatus);
router.get("/students/class/:classId", authenticate, authorizeRole(["admin", "teacher", "classteacher", "bursar"]), getStudentsByClass);
router.get("/students/:id", authenticate, authorizeRole(["admin", "bursar", "classteacher"]), getStudentById);

// ── Staff ──────────────────────────────────────────────────────────────────────
router.patch("/staff/:id/photo", authenticate, authorizeRole(["admin"]), upload.single("photo"), uploadStaffPhoto);
router.patch("/staff/:id/id-document", authenticate, authorizeRole(["admin"]), upload.single("document"), uploadStaffIdDocument);
router.post("/staff", authenticate, authorizeRole(["admin"]), createStaff);
router.put("/staff/:id", authenticate, authorizeRole(["admin"]), updateStaff);
router.delete("/staff/:id", authenticate, authorizeRole(["admin"]), deleteStaff);
router.patch("/staff/:id/status", authenticate, authorizeRole(["admin"]), setStaffStatus);
router.post("/staff/add-subject", authenticate, authorizeRole(["admin"]), addSubjectToTeacher);
router.delete("/staff/:staffId/subject/:subjectId", authenticate, authorizeRole(["admin"]), removeSubjectFromTeacher);
router.post("/staff/add-class", authenticate, authorizeRole(["admin"]), addClassToTeacher);
router.delete("/staff/:staffId/class/:classId", authenticate, authorizeRole(["admin"]), removeClassFromTeacher);
router.post("/staff/with-account", authenticate, authorizeRole(["admin"]), createStaffWithAccount);

router.get("/staff", authenticate, authorizeRole(["admin"]), getAllStaff);
router.get("/staff/department/:department", authenticate, authorizeRole(["admin"]), getStaffByDepartment);
router.get("/staff/status/:status", authenticate, authorizeRole(["admin"]), getStaffByStatus);
router.get("/staff/subject/:subjectId", authenticate, authorizeRole(["admin"]), getTeachersBySubject);
router.get("/staff/class/:classId", authenticate, authorizeRole(["admin"]), getTeachersByClass);
router.get("/staff/:id", authenticate, authorizeRole(["admin", "teacher", "classteacher", "bursar", "non-teaching"]), getStaffById);

// ── Parents ────────────────────────────────────────────────────────────────────
router.patch("/parents/:id/photo", authenticate, authorizeRole(["admin"]), upload.single("photo"), uploadParentPhoto);
router.patch("/parents/:id/id-document", authenticate, authorizeRole(["admin"]), upload.single("document"), uploadParentIdDocument);
router.post("/parents", authenticate, authorizeRole(["admin"]), createParent);
router.put("/parents/:id", authenticate, authorizeRole(["admin"]), updateParent);
router.delete("/parents/:id", authenticate, authorizeRole(["admin"]), deleteParent);
router.post("/parents/add-student", authenticate, authorizeRole(["admin"]), addStudentToParent);
router.delete("/parents/:parentId/student/:studentId", authenticate, authorizeRole(["admin"]), removeStudentFromParent);
router.post("/parents/with-account", authenticate, authorizeRole(["admin"]), createParentWithAccount);

router.get("/parents", authenticate, authorizeRole(["admin", "bursar"]), getAllParents);
router.get("/parents/:id", authenticate, authorizeRole(["admin", "bursar"]), getParentById);
router.get("/parents/student/:studentId", authenticate, authorizeRole(["admin", "bursar"]), getParentsByStudentId);

module.exports = router;
