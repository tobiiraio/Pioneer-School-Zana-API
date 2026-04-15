const express = require('express');
const router = express.Router();
const {
  createSchoolFees,
  getAllSchoolFees,
  getSchoolFeesById,
  updateSchoolFees,
  deleteSchoolFees,
  getSchoolFeesByStudent,
  getSchoolFeesByClass,
  getSchoolFeesByTerm,
  getStudentBalance,
  generateSchoolFeesReport,
  getAdminView
} = require('../controllers/schoolfees.controller');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

// Admin + bursar — full financial management
router.post('/', authenticate, authorizeRole(['admin', 'bursar']), createSchoolFees);
router.put('/:id', authenticate, authorizeRole(['admin', 'bursar']), updateSchoolFees);
router.delete('/:id', authenticate, authorizeRole(['admin']), deleteSchoolFees);

// Admin + bursar — reads
router.get('/', authenticate, authorizeRole(['admin', 'bursar']), getAllSchoolFees);
router.get('/report/summary', authenticate, authorizeRole(['admin', 'bursar']), generateSchoolFeesReport);
router.get('/admin/view', authenticate, authorizeRole(['admin', 'bursar']), getAdminView);
router.get('/class/:classId', authenticate, authorizeRole(['admin', 'bursar']), getSchoolFeesByClass);
router.get('/term/:termId', authenticate, authorizeRole(['admin', 'bursar']), getSchoolFeesByTerm);
router.get('/:id', authenticate, authorizeRole(['admin', 'bursar']), getSchoolFeesById);
router.get('/student/:studentId', authenticate, authorizeRole(['admin', 'bursar']), getSchoolFeesByStudent);
router.get('/student/:studentId/balance', authenticate, authorizeRole(['admin', 'bursar']), getStudentBalance);

module.exports = router;
