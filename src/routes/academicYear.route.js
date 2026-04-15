const express = require('express');
const router = express.Router();
const {
  createAcademicYear,
  getAllAcademicYears,
  getAcademicYearById,
  updateAcademicYear,
  deleteAcademicYear
} = require('../controllers/academicYear.controller');

// Authenticate middleware (to protect routes)
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

router.post('/', authenticate, authorizeRole(['admin']), createAcademicYear);
router.get('/', authenticate, authorizeRole(['admin', 'teacher', 'classteacher', 'bursar', 'non-teaching']), getAllAcademicYears);
router.get('/:id', authenticate, authorizeRole(['admin', 'teacher', 'classteacher', 'bursar', 'non-teaching']), getAcademicYearById);
router.put('/:id', authenticate, authorizeRole(['admin']), updateAcademicYear);
router.delete('/:id', authenticate, authorizeRole(['admin']), deleteAcademicYear);

module.exports = router;
