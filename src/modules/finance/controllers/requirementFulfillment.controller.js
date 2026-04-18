const service = require("../services/requirementFulfillment.service");

async function createRequirementFulfillment(req, res, next) {
  try {
    const data = await service.create(req.body, req.user._id);
    res.status(201).json({ message: "Requirement fulfillment created successfully", data });
  } catch (err) {
    if (err.status === 409) return res.status(409).json({ message: err.message, data: err.data });
    next(err);
  }
}

async function getAllRequirementFulfillments(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getRequirementFulfillmentById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateRequirementFulfillment(req, res, next) {
  try { res.json({ message: "Requirement fulfillment updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteRequirementFulfillment(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Requirement fulfillment deleted successfully" }); }
  catch (err) { next(err); }
}

async function getStudentFulfillments(req, res, next) {
  try { res.json(await service.getByStudent(req.params.studentId)); }
  catch (err) { next(err); }
}

async function getRequirementSetFulfillments(req, res, next) {
  try { res.json(await service.getByRequirementSet(req.params.requirementSetId)); }
  catch (err) { next(err); }
}

async function getStudentRequirementSetFulfillment(req, res, next) {
  try { res.json(await service.getByStudentAndSet(req.params.studentId, req.params.requirementSetId)); }
  catch (err) { next(err); }
}

async function updateFulfillmentItems(req, res, next) {
  try { res.json({ message: "Fulfillment items updated successfully", data: await service.updateItems(req.params.fulfillmentId, req.body) }); }
  catch (err) { next(err); }
}

module.exports = {
  createRequirementFulfillment, getAllRequirementFulfillments, getRequirementFulfillmentById,
  updateRequirementFulfillment, deleteRequirementFulfillment,
  getStudentFulfillments, getRequirementSetFulfillments, getStudentRequirementSetFulfillment,
  updateFulfillmentItems,
};
