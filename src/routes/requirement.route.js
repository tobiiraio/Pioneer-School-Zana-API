const express = require('express');
const router = express.Router();
const {
  createRequirement,
  getAllRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement
} = require('../controllers/requirement.controller');

const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

// Admin + bursar — full lifecycle
router.post('/', authenticate, authorizeRole(['admin', 'bursar']), createRequirement);
router.put('/:id', authenticate, authorizeRole(['admin', 'bursar']), updateRequirement);
router.delete('/:id', authenticate, authorizeRole(['admin', 'bursar']), deleteRequirement);
router.get('/', authenticate, authorizeRole(['admin', 'bursar']), getAllRequirements);
router.get('/:id', authenticate, authorizeRole(['admin', 'bursar']), getRequirementById);

module.exports = router;
