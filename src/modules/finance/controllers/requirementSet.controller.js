const service = require("../services/requirementSet.service");

async function createRequirementSet(req, res, next) {
  try { res.status(201).json({ message: "Requirement Set created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllRequirementSets(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getRequirementSetById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateRequirementSet(req, res, next) {
  try { res.json({ message: "Requirement Set updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteRequirementSet(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Requirement Set deleted successfully" }); }
  catch (err) { next(err); }
}

module.exports = { createRequirementSet, getAllRequirementSets, getRequirementSetById, updateRequirementSet, deleteRequirementSet };
