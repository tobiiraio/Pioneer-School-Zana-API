const service = require("../services/subject.service");

async function createSubject(req, res, next) {
  try { res.status(201).json({ message: "Subject created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllSubjects(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getSubjectById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateSubject(req, res, next) {
  try { res.json({ message: "Subject updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteSubject(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Subject deleted successfully" }); }
  catch (err) { next(err); }
}

module.exports = { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject };
