const express = require('express');
const router = express.Router();

const {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass
} = require('../controllers/class.controller');

const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

// Routes
router.post('/', authenticate, authorizeRole(['admin']), createClass);
router.get('/', authenticate, authorizeRole(['admin', 'teacher', 'classteacher', 'bursar', 'non-teaching']), getAllClasses);
router.get('/:id', authenticate, authorizeRole(['admin', 'teacher', 'classteacher', 'bursar', 'non-teaching']), getClassById);
router.put('/:id', authenticate, authorizeRole(['admin']), updateClass);
router.delete('/:id', authenticate, authorizeRole(['admin']), deleteClass);

module.exports = router;
