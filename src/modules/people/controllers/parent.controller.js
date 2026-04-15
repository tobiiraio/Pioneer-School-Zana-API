const service = require("../services/parent.service");

async function createParent(req, res, next) {
  try { res.status(201).json({ message: "Parent created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllParents(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getParentById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateParent(req, res, next) {
  try { res.json({ message: "Parent updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteParent(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Parent deleted successfully" }); }
  catch (err) { next(err); }
}

async function addStudentToParent(req, res, next) {
  try { res.json({ message: "Student added to parent successfully", data: await service.addStudent(req.body) }); }
  catch (err) { next(err); }
}

async function removeStudentFromParent(req, res, next) {
  try { res.json({ message: "Student removed from parent successfully", data: await service.removeStudent(req.params.parentId, req.params.studentId) }); }
  catch (err) { next(err); }
}

async function getParentsByStudentId(req, res, next) {
  try { res.json(await service.getByStudent(req.params.studentId)); }
  catch (err) { next(err); }
}

async function createParentWithAccount(req, res, next) {
  try { res.status(201).json({ message: "Parent created successfully with user account", data: await service.createWithAccount(req.body) }); }
  catch (err) { next(err); }
}

module.exports = {
  createParent, getAllParents, getParentById, updateParent, deleteParent,
  addStudentToParent, removeStudentFromParent, getParentsByStudentId, createParentWithAccount,
};
