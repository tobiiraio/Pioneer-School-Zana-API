const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../../middlewares/auth.middleware");

const {
  createSchoolFees, getAllSchoolFees, getSchoolFeesById, updateSchoolFees, deleteSchoolFees,
  getSchoolFeesByStudent, getSchoolFeesByClass, getSchoolFeesByTerm,
  getStudentBalance, generateSchoolFeesReport, getAdminView,
} = require("./schoolfees.controller");

const {
  createRequirement, getAllRequirements, getRequirementById, updateRequirement, deleteRequirement,
} = require("./requirement.controller");

const {
  createRequirementSet, getAllRequirementSets, getRequirementSetById, updateRequirementSet, deleteRequirementSet,
} = require("./requirementSet.controller");

const {
  createRequirementFulfillment, getAllRequirementFulfillments, getRequirementFulfillmentById,
  updateRequirementFulfillment, deleteRequirementFulfillment,
  getStudentFulfillments, getRequirementSetFulfillments, getStudentRequirementSetFulfillment,
  updateFulfillmentItems,
} = require("./requirementFulfillment.controller");

// ── School Fees ────────────────────────────────────────────────────────────────
router.post("/school-fees", authenticate, authorizeRole(["admin", "bursar"]), createSchoolFees);
router.put("/school-fees/:id", authenticate, authorizeRole(["admin", "bursar"]), updateSchoolFees);
router.delete("/school-fees/:id", authenticate, authorizeRole(["admin"]), deleteSchoolFees);

router.get("/school-fees", authenticate, authorizeRole(["admin", "bursar"]), getAllSchoolFees);
router.get("/school-fees/report/summary", authenticate, authorizeRole(["admin", "bursar"]), generateSchoolFeesReport);
router.get("/school-fees/admin/view", authenticate, authorizeRole(["admin", "bursar"]), getAdminView);
router.get("/school-fees/class/:classId", authenticate, authorizeRole(["admin", "bursar"]), getSchoolFeesByClass);
router.get("/school-fees/term/:termId", authenticate, authorizeRole(["admin", "bursar"]), getSchoolFeesByTerm);
router.get("/school-fees/student/:studentId", authenticate, authorizeRole(["admin", "bursar"]), getSchoolFeesByStudent);
router.get("/school-fees/student/:studentId/balance", authenticate, authorizeRole(["admin", "bursar"]), getStudentBalance);
router.get("/school-fees/:id", authenticate, authorizeRole(["admin", "bursar"]), getSchoolFeesById);

// ── Requirements ───────────────────────────────────────────────────────────────
router.post("/requirements", authenticate, authorizeRole(["admin", "bursar"]), createRequirement);
router.put("/requirements/:id", authenticate, authorizeRole(["admin", "bursar"]), updateRequirement);
router.delete("/requirements/:id", authenticate, authorizeRole(["admin", "bursar"]), deleteRequirement);
router.get("/requirements", authenticate, authorizeRole(["admin", "bursar"]), getAllRequirements);
router.get("/requirements/:id", authenticate, authorizeRole(["admin", "bursar"]), getRequirementById);

// ── Requirement Sets ───────────────────────────────────────────────────────────
router.post("/requirement-sets", authenticate, authorizeRole(["admin", "bursar"]), createRequirementSet);
router.put("/requirement-sets/:id", authenticate, authorizeRole(["admin", "bursar"]), updateRequirementSet);
router.delete("/requirement-sets/:id", authenticate, authorizeRole(["admin", "bursar"]), deleteRequirementSet);
router.get("/requirement-sets", authenticate, authorizeRole(["admin", "bursar"]), getAllRequirementSets);
router.get("/requirement-sets/:id", authenticate, authorizeRole(["admin", "bursar"]), getRequirementSetById);

// ── Requirement Fulfillments ───────────────────────────────────────────────────
router.post("/requirement-fulfillments", authenticate, authorizeRole(["admin", "bursar"]), createRequirementFulfillment);
router.put("/requirement-fulfillments/:id", authenticate, authorizeRole(["admin", "bursar"]), updateRequirementFulfillment);
router.delete("/requirement-fulfillments/:id", authenticate, authorizeRole(["admin", "bursar"]), deleteRequirementFulfillment);
router.patch("/requirement-fulfillments/:fulfillmentId/items", authenticate, authorizeRole(["admin", "bursar"]), updateFulfillmentItems);

router.get("/requirement-fulfillments", authenticate, authorizeRole(["admin", "bursar"]), getAllRequirementFulfillments);
router.get("/requirement-fulfillments/student/:studentId", authenticate, authorizeRole(["admin", "bursar"]), getStudentFulfillments);
router.get("/requirement-fulfillments/requirement-set/:requirementSetId", authenticate, authorizeRole(["admin", "bursar"]), getRequirementSetFulfillments);
router.get("/requirement-fulfillments/student/:studentId/requirement-set/:requirementSetId", authenticate, authorizeRole(["admin", "bursar"]), getStudentRequirementSetFulfillment);
router.get("/requirement-fulfillments/:id", authenticate, authorizeRole(["admin", "bursar"]), getRequirementFulfillmentById);

module.exports = router;
