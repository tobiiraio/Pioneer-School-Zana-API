const service = require("../services/staff.service");

async function createStaff(req, res, next) {
  try { res.status(201).json({ message: "Staff created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllStaff(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getStaffById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateStaff(req, res, next) {
  try { res.json({ message: "Staff updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteStaff(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Staff deleted successfully" }); }
  catch (err) { next(err); }
}

async function getStaffByDepartment(req, res, next) {
  try { res.json(await service.getByDepartment(req.params.department)); }
  catch (err) { next(err); }
}

async function getStaffByStatus(req, res, next) {
  try { res.json(await service.getByStatus(req.params.status)); }
  catch (err) { next(err); }
}

async function addSubjectToTeacher(req, res, next) {
  try { res.json({ message: "Subject added to teacher successfully", data: await service.addSubject(req.body) }); }
  catch (err) { next(err); }
}

async function removeSubjectFromTeacher(req, res, next) {
  try { res.json({ message: "Subject removed from teacher successfully", data: await service.removeSubject(req.params.staffId, req.params.subjectId) }); }
  catch (err) { next(err); }
}

async function addClassToTeacher(req, res, next) {
  try { res.json({ message: "Class added to teacher successfully", data: await service.addClass(req.body) }); }
  catch (err) { next(err); }
}

async function removeClassFromTeacher(req, res, next) {
  try { res.json({ message: "Class removed from teacher successfully", data: await service.removeClass(req.params.staffId, req.params.classId) }); }
  catch (err) { next(err); }
}

async function setStaffStatus(req, res, next) {
  try { res.json({ message: "Staff status updated successfully", data: await service.setStatus(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function createStaffWithAccount(req, res, next) {
  try { res.status(201).json({ message: "Staff created successfully with user account", data: await service.createWithAccount(req.body) }); }
  catch (err) { next(err); }
}

async function getTeachersBySubject(req, res, next) {
  try { res.json(await service.getBySubject(req.params.subjectId)); }
  catch (err) { next(err); }
}

async function getTeachersByClass(req, res, next) {
  try { res.json(await service.getByClass(req.params.classId)); }
  catch (err) { next(err); }
}

module.exports = {
  createStaff, getAllStaff, getStaffById, updateStaff, deleteStaff,
  getStaffByDepartment, getStaffByStatus, setStaffStatus,
  addSubjectToTeacher, removeSubjectFromTeacher, addClassToTeacher, removeClassFromTeacher,
  createStaffWithAccount, getTeachersBySubject, getTeachersByClass,
};
