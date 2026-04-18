const service = require("../services/schoolfees.service");

async function createSchoolFees(req, res, next) {
  try { res.status(201).json({ message: "School fees transaction created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllSchoolFees(req, res, next) {
  try { res.json(await service.getAll(req.query)); }
  catch (err) { next(err); }
}

async function getSchoolFeesById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateSchoolFees(req, res, next) {
  try { res.json({ message: "School fees transaction updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function deleteSchoolFees(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "School fees transaction deleted successfully" }); }
  catch (err) { next(err); }
}

async function getSchoolFeesByStudent(req, res, next) {
  try { res.json(await service.getByStudent(req.params.studentId, req.query.termId)); }
  catch (err) { next(err); }
}

async function getSchoolFeesByClass(req, res, next) {
  try { res.json(await service.getByClass(req.params.classId, req.query.termId)); }
  catch (err) { next(err); }
}

async function getSchoolFeesByTerm(req, res, next) {
  try { res.json(await service.getByTerm(req.params.termId)); }
  catch (err) { next(err); }
}

async function getStudentBalance(req, res, next) {
  try { res.json(await service.getStudentBalance(req.params.studentId, req.query.termId)); }
  catch (err) { next(err); }
}

async function generateSchoolFeesReport(req, res, next) {
  try { res.json(await service.generateReport(req.query)); }
  catch (err) { next(err); }
}

async function getAdminView(req, res, next) {
  try { res.json(await service.getAdminView(req.query)); }
  catch (err) { next(err); }
}

module.exports = { createSchoolFees, getAllSchoolFees, getSchoolFeesById, updateSchoolFees, deleteSchoolFees, getSchoolFeesByStudent, getSchoolFeesByClass, getSchoolFeesByTerm, getStudentBalance, generateSchoolFeesReport, getAdminView };
