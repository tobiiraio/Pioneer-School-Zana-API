const express = require('express');
const router = express.Router();
const {
  createRequirementSet,
  getAllRequirementSets,
  getRequirementSetById,
  updateRequirementSet,
  deleteRequirementSet
} = require('../controllers/requirementSet.controller');

const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

// Admin + bursar — full lifecycle
router.post('/', authenticate, authorizeRole(['admin', 'bursar']), createRequirementSet);
router.put('/:id', authenticate, authorizeRole(['admin', 'bursar']), updateRequirementSet);
router.delete('/:id', authenticate, authorizeRole(['admin', 'bursar']), deleteRequirementSet);
router.get('/', authenticate, authorizeRole(['admin', 'bursar']), getAllRequirementSets);
router.get('/:id', authenticate, authorizeRole(['admin', 'bursar']), getRequirementSetById);

module.exports = router;
