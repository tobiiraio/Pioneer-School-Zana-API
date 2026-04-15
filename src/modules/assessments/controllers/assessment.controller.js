const service = require("../services/assessment.service");

exports.createAssessment = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.body, req.user.userId)); }
  catch (err) { next(err); }
};

exports.getAssessments = async (req, res, next) => {
  try { res.json(await service.getAll(req.query, req.user)); }
  catch (err) { next(err); }
};

exports.getAssessmentById = async (req, res, next) => {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
};

exports.getAssessmentsByClass = async (req, res, next) => {
  try { res.json(await service.getByClass(req.params.classId, req.query.termId)); }
  catch (err) { next(err); }
};

exports.getAssessmentsByTerm = async (req, res, next) => {
  try { res.json(await service.getByTerm(req.params.termId, req.query.classId)); }
  catch (err) { next(err); }
};

exports.updateAssessment = async (req, res, next) => {
  try { res.json(await service.update(req.params.id, req.body)); }
  catch (err) { next(err); }
};

exports.deleteAssessment = async (req, res, next) => {
  try { await service.remove(req.params.id); res.json({ message: "Assessment deleted" }); }
  catch (err) { next(err); }
};
