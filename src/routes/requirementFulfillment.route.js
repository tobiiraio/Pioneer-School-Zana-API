const express = require('express');
const router = express.Router();
const {
  createRequirementFulfillment,
  getAllRequirementFulfillments,
  getRequirementFulfillmentById,
  updateRequirementFulfillment,
  deleteRequirementFulfillment,
  getStudentFulfillments,
  getRequirementSetFulfillments,
  getStudentRequirementSetFulfillment,
  updateFulfillmentItems
} = require('../controllers/requirementFulfillment.controller');

const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

// Admin + bursar — full lifecycle
router.post('/', authenticate, authorizeRole(['admin', 'bursar']), createRequirementFulfillment);
router.put('/:id', authenticate, authorizeRole(['admin', 'bursar']), updateRequirementFulfillment);
router.delete('/:id', authenticate, authorizeRole(['admin', 'bursar']), deleteRequirementFulfillment);
router.patch('/:fulfillmentId/items', authenticate, authorizeRole(['admin', 'bursar']), updateFulfillmentItems);

// Admin + bursar — reads
router.get('/', authenticate, authorizeRole(['admin', 'bursar']), getAllRequirementFulfillments);
router.get('/:id', authenticate, authorizeRole(['admin', 'bursar']), getRequirementFulfillmentById);
router.get('/student/:studentId', authenticate, authorizeRole(['admin', 'bursar']), getStudentFulfillments);
router.get('/requirement-set/:requirementSetId', authenticate, authorizeRole(['admin', 'bursar']), getRequirementSetFulfillments);
router.get('/student/:studentId/requirement-set/:requirementSetId', authenticate, authorizeRole(['admin', 'bursar']), getStudentRequirementSetFulfillment);

module.exports = router;
