const service = require("../services/academicTerm.service");

async function createAcademicTerm(req, res, next) {
  try { res.status(201).json({ message: "Academic term created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllAcademicTerms(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getAcademicTermById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateAcademicTerm(req, res, next) {
  try { res.json({ message: "Academic term updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteAcademicTerm(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Academic term deleted successfully" }); }
  catch (err) { next(err); }
}

module.exports = { createAcademicTerm, getAllAcademicTerms, getAcademicTermById, updateAcademicTerm, deleteAcademicTerm };
