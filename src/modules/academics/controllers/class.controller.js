const service = require("../services/class.service");

async function createClass(req, res, next) {
  try { res.status(201).json({ message: "Class created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllClasses(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getClassById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateClass(req, res, next) {
  try { res.json({ message: "Class updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteClass(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Class deleted successfully" }); }
  catch (err) { next(err); }
}

module.exports = { createClass, getAllClasses, getClassById, updateClass, deleteClass };
