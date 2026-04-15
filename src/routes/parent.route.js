const express = require('express');
const router = express.Router();
const {
  createParent,
  getAllParents,
  getParentById,
  updateParent,
  deleteParent,
  addStudentToParent,
  removeStudentFromParent,
  getParentsByStudentId,
  createParentWithAccount
} = require('../controllers/parent.controller');

const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

// Admin only — all writes
router.post('/', authenticate, authorizeRole(['admin']), createParent);
router.put('/:id', authenticate, authorizeRole(['admin']), updateParent);
router.delete('/:id', authenticate, authorizeRole(['admin']), deleteParent);
router.post('/add-student', authenticate, authorizeRole(['admin']), addStudentToParent);
router.delete('/:parentId/student/:studentId', authenticate, authorizeRole(['admin']), removeStudentFromParent);
router.post('/with-account', authenticate, authorizeRole(['admin']), createParentWithAccount);

// Admin + bursar — list all parents (bursar gets partial fields via controller)
router.get('/', authenticate, authorizeRole(['admin', 'bursar']), getAllParents);
router.get('/:id', authenticate, authorizeRole(['admin', 'bursar']), getParentById);
router.get('/student/:studentId', authenticate, authorizeRole(['admin', 'bursar']), getParentsByStudentId);

module.exports = router;
