const Grade = require("../models/grade.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

const checkOverlap = async (minScore, maxScore, excludeId = null) => {
  const query = {
    $or: [
      { minScore: { $lte: maxScore }, maxScore: { $gte: minScore } },
    ],
  };
  if (excludeId) query._id = { $ne: excludeId };
  const overlap = await Grade.findOne(query);
  if (overlap) throw err(`Score range overlaps with existing grade: ${overlap.label}`, 400);
};

exports.getAll = async () => Grade.find().sort({ minScore: 1 });

exports.create = async (data) => {
  const { label, minScore, maxScore, remark, points, order } = data;
  if (minScore > maxScore) throw err("minScore must be less than or equal to maxScore", 400);
  await checkOverlap(minScore, maxScore);
  const grade = new Grade({ label, minScore, maxScore, remark, points, order });
  await grade.save();
  return grade;
};

exports.update = async (id, data) => {
  const existing = await Grade.findById(id);
  if (!existing) throw err("Grade not found", 404);
  const minScore = data.minScore ?? existing.minScore;
  const maxScore = data.maxScore ?? existing.maxScore;
  if (minScore > maxScore) throw err("minScore must be less than or equal to maxScore", 400);
  if (data.minScore !== undefined || data.maxScore !== undefined) {
    await checkOverlap(minScore, maxScore, id);
  }
  Object.assign(existing, data);
  await existing.save();
  return existing;
};

exports.remove = async (id) => {
  const grade = await Grade.findByIdAndDelete(id);
  if (!grade) throw err("Grade not found", 404);
};

/**
 * Resolve a raw score against the grading scale.
 * @param {number} score - Raw score achieved
 * @param {number} maxScore - Maximum possible score for the assessment
 * @returns {{ label, remark, points } | null}
 */
exports.resolveGrade = async (score, maxScore) => {
  if (score == null || !maxScore) return null;
  const pct = (score / maxScore) * 100;
  const grade = await Grade.findOne({ minScore: { $lte: pct }, maxScore: { $gte: pct } });
  if (!grade) return null;
  return { label: grade.label, remark: grade.remark, points: grade.points };
};
