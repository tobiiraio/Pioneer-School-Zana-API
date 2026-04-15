const service = require("../services/academicYear.service");

async function createAcademicYear(req, res, next) {
  try { res.status(201).json({ message: "Academic year created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllAcademicYears(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getAcademicYearById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateAcademicYear(req, res, next) {
  try { res.json({ message: "Academic year updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteAcademicYear(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Academic year deleted successfully" }); }
  catch (err) { next(err); }
}

module.exports = { createAcademicYear, getAllAcademicYears, getAcademicYearById, updateAcademicYear, deleteAcademicYear };
