const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  addParentToStudent,
  removeParentFromStudent,
  getStudentsByClass,
  getStudentsByStatus,
  updatePrimaryContact,
  createStudentWithAccount
} = require('../controllers/student.controller');

const { authenticate, authorizeRole, authorizeClassAccess } = require('../middlewares/auth.middleware');

// Admin only — create, update, delete, relationship management
router.post('/', authenticate, authorizeRole(['admin']), createStudent);
router.put('/:id', authenticate, authorizeRole(['admin']), updateStudent);
router.delete('/:id', authenticate, authorizeRole(['admin']), deleteStudent);
router.post('/add-parent', authenticate, authorizeRole(['admin']), addParentToStudent);
router.delete('/:studentId/parent/:parentId', authenticate, authorizeRole(['admin']), removeParentFromStudent);
router.put('/primary-contact', authenticate, authorizeRole(['admin']), updatePrimaryContact);
router.post('/with-account', authenticate, authorizeRole(['admin']), createStudentWithAccount);

// Admin + bursar — list all students (bursar gets partial fields via controller)
router.get('/', authenticate, authorizeRole(['admin', 'bursar']), getAllStudents);

// Admin + bursar + classteacher — view individual student
router.get('/:id', authenticate, authorizeRole(['admin', 'bursar', 'classteacher']), getStudentById);

// Admin + teacher + classteacher — view students by class (scoped to assigned class for teachers)
router.get('/class/:classId', authenticate, authorizeRole(['admin', 'teacher', 'classteacher', 'bursar']), getStudentsByClass);

// Admin only — filter by status
router.get('/status/:status', authenticate, authorizeRole(['admin']), getStudentsByStatus);

module.exports = router;
