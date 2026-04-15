const service = require("../services/report.service");

exports.getStudentReport = async (req, res, next) => {
  try { res.json(await service.getStudentReport(req.params.studentId, req.params.termId)); }
  catch (err) { next(err); }
};

exports.getClassReport = async (req, res, next) => {
  try { res.json(await service.getClassReport(req.params.classId, req.params.termId, req.user)); }
  catch (err) { next(err); }
};
