const service = require("../services/mark.service");

exports.createMark = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.body, req.user)); }
  catch (err) { next(err); }
};

exports.bulkCreateMarks = async (req, res, next) => {
  try { res.status(201).json(await service.bulkCreate(req.body, req.user)); }
  catch (err) { next(err); }
};

exports.getMarksByAssessment = async (req, res, next) => {
  try { res.json(await service.getByAssessment(req.params.assessmentId, req.user)); }
  catch (err) { next(err); }
};

exports.getMarksByStudent = async (req, res, next) => {
  try { res.json(await service.getByStudent(req.params.studentId, req.query.termId)); }
  catch (err) { next(err); }
};

exports.updateMark = async (req, res, next) => {
  try { res.json(await service.update(req.params.id, req.body, req.user)); }
  catch (err) { next(err); }
};

exports.deleteMark = async (req, res, next) => {
  try { await service.remove(req.params.id); res.json({ message: "Mark deleted" }); }
  catch (err) { next(err); }
};
