const service = require("../services/student.service");

async function createStudent(req, res, next) {
  try { res.status(201).json({ message: "Student created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllStudents(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getStudentById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateStudent(req, res, next) {
  try { res.json({ message: "Student updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteStudent(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Student deleted successfully" }); }
  catch (err) { next(err); }
}

async function addParentToStudent(req, res, next) {
  try { res.json({ message: "Parent added to student successfully", data: await service.addParent(req.body) }); }
  catch (err) { next(err); }
}

async function removeParentFromStudent(req, res, next) {
  try { res.json({ message: "Parent removed from student successfully", data: await service.removeParent(req.params.studentId, req.params.parentId) }); }
  catch (err) { next(err); }
}

async function getStudentsByClass(req, res, next) {
  try { res.json(await service.getByClass(req.params.classId)); }
  catch (err) { next(err); }
}

async function getStudentsByStatus(req, res, next) {
  try { res.json(await service.getByStatus(req.params.status)); }
  catch (err) { next(err); }
}

async function updatePrimaryContact(req, res, next) {
  try { res.json({ message: "Primary contact updated successfully", data: await service.updatePrimaryContact(req.body) }); }
  catch (err) { next(err); }
}

async function createStudentWithAccount(req, res, next) {
  try { res.status(201).json({ message: "Student created successfully with user account", data: await service.createWithAccount(req.body) }); }
  catch (err) { next(err); }
}

async function uploadStudentPhoto(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ message: "Photo uploaded successfully", data: await service.uploadPhoto(req.params.id, req.file) });
  }
  catch (err) { next(err); }
}

module.exports = {
  createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent,
  addParentToStudent, removeParentFromStudent, getStudentsByClass, getStudentsByStatus,
  updatePrimaryContact, createStudentWithAccount, uploadStudentPhoto,
};
