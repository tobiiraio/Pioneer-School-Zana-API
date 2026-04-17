const service = require("../services/grade.service");

async function getAllGrades(req, res, next) {
  try { res.json({ message: "Grades fetched successfully", data: await service.getAll() }); }
  catch (err) { next(err); }
}

async function createGrade(req, res, next) {
  try { res.status(201).json({ message: "Grade created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function updateGrade(req, res, next) {
  try { res.json({ message: "Grade updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteGrade(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Grade deleted successfully" }); }
  catch (err) { next(err); }
}

module.exports = { getAllGrades, createGrade, updateGrade, deleteGrade };
