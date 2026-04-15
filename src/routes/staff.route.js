const express = require('express');
const router = express.Router();
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffByDepartment,
  getStaffByStatus,
  setStaffStatus,
  addSubjectToTeacher,
  removeSubjectFromTeacher,
  addClassToTeacher,
  removeClassFromTeacher,
  createStaffWithAccount,
  getTeachersBySubject,
  getTeachersByClass
} = require('../controllers/staff.controller');

const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

// Admin only — all writes
router.post('/', authenticate, authorizeRole(['admin']), createStaff);
router.put('/:id', authenticate, authorizeRole(['admin']), updateStaff);
router.delete('/:id', authenticate, authorizeRole(['admin']), deleteStaff);
router.patch('/:id/status', authenticate, authorizeRole(['admin']), setStaffStatus);
router.post('/add-subject', authenticate, authorizeRole(['admin']), addSubjectToTeacher);
router.delete('/:staffId/subject/:subjectId', authenticate, authorizeRole(['admin']), removeSubjectFromTeacher);
router.post('/add-class', authenticate, authorizeRole(['admin']), addClassToTeacher);
router.delete('/:staffId/class/:classId', authenticate, authorizeRole(['admin']), removeClassFromTeacher);
router.post('/with-account', authenticate, authorizeRole(['admin']), createStaffWithAccount);

// Admin only — reads
router.get('/', authenticate, authorizeRole(['admin']), getAllStaff);
router.get('/department/:department', authenticate, authorizeRole(['admin']), getStaffByDepartment);
router.get('/status/:status', authenticate, authorizeRole(['admin']), getStaffByStatus);
router.get('/subject/:subjectId', authenticate, authorizeRole(['admin']), getTeachersBySubject);
router.get('/class/:classId', authenticate, authorizeRole(['admin']), getTeachersByClass);

// Staff can view their own record
router.get('/:id', authenticate, authorizeRole(['admin', 'teacher', 'classteacher', 'bursar', 'non-teaching']), getStaffById);

module.exports = router;
