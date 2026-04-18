const service = require("../services/requirement.service");

async function createRequirement(req, res, next) {
  try { res.status(201).json({ message: "Requirement created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllRequirements(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getRequirementById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateRequirement(req, res, next) {
  try { res.json({ message: "Requirement updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteRequirement(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Requirement deleted successfully" }); }
  catch (err) { next(err); }
}

module.exports = { createRequirement, getAllRequirements, getRequirementById, updateRequirement, deleteRequirement };
