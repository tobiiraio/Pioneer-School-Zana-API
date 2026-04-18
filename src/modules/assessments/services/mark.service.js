const Mark = require("../models/mark.model");
const Assessment = require("../models/assessment.model");
const { Staff } = require("../../people");

const err = (msg, status) => Object.assign(new Error(msg), { status });

const verifyTeacherAccess = async (userId, subrole, assessment) => {
  if (subrole === "admin") return true;
  const staff = await Staff.findOne({ user: userId });
  if (!staff) return false;
  const assignedClasses = staff.classes.map((c) => c.toString());
  const assignedSubjects = staff.subjects.map((s) => s.toString());
  if (subrole === "classteacher") return assignedClasses.includes(assessment.class.toString());
  return assignedClasses.includes(assessment.class.toString()) && assignedSubjects.includes(assessment.subject.toString());
};

exports.create = async ({ assessment: assessmentId, student, score, remarks }, { role, subrole, userId }) => {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw err("Assessment not found", 404);
  if (score > assessment.maxScore) throw err(`Score cannot exceed maxScore of ${assessment.maxScore}`, 400);
  if (role !== "admin") {
    const allowed = await verifyTeacherAccess(userId, subrole, assessment);
    if (!allowed) throw err("You are not assigned to this class/subject", 403);
  }
  try {
    const mark = new Mark({ assessment: assessmentId, student, score, remarks, gradedBy: userId });
    await mark.save();
    await mark.populate(["assessment", "student", "gradedBy"]);
    return mark;
  } catch (e) {
    if (e.code === 11000) throw err("Mark already exists for this student and assessment", 400);
    throw e;
  }
};

exports.bulkCreate = async ({ assessmentId, marks }, { role, subrole, userId }) => {
  if (!assessmentId || !Array.isArray(marks) || marks.length === 0)
    throw err("assessmentId and marks array are required", 400);
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw err("Assessment not found", 404);
  if (role !== "admin") {
    const allowed = await verifyTeacherAccess(userId, subrole, assessment);
    if (!allowed) throw err("You are not assigned to this class/subject", 403);
  }
  const invalid = marks.filter((m) => m.score > assessment.maxScore);
  if (invalid.length > 0) throw err(`Some scores exceed maxScore of ${assessment.maxScore}`, 400);
  const docs = marks.map((m) => ({ assessment: assessmentId, student: m.student, score: m.score, remarks: m.remarks || "", gradedBy: userId }));
  const results = await Promise.allSettled(
    docs.map((doc) => Mark.findOneAndUpdate({ assessment: doc.assessment, student: doc.student }, doc, { upsert: true, new: true, runValidators: true }))
  );
  const saved = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  return { message: `${saved} marks saved, ${failed} failed`, saved, failed };
};

exports.getByAssessment = async (assessmentId, { role, subrole, userId }) => {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw err("Assessment not found", 404);
  if (role !== "admin") {
    const allowed = await verifyTeacherAccess(userId, subrole, assessment);
    if (!allowed) throw err("You are not assigned to this class/subject", 403);
  }
  return Mark.find({ assessment: assessmentId })
    .populate("student", "firstName lastName currentClass").populate("gradedBy", "name").sort({ score: -1 });
};

exports.getByStudent = async (studentId, termId) => {
  const filter = { student: studentId };
  if (termId) {
    const assessments = await Assessment.find({ academicTerm: termId }).select("_id");
    filter.assessment = { $in: assessments.map((a) => a._id) };
  }
  return Mark.find(filter)
    .populate({ path: "assessment", select: "title category type subject academicTerm maxScore date", populate: [{ path: "subject", select: "name" }, { path: "academicTerm", select: "name" }] })
    .populate("gradedBy", "name").sort({ createdAt: -1 });
};

exports.update = async (id, data, { role, userId }) => {
  const mark = await Mark.findById(id).populate("assessment");
  if (!mark) throw err("Mark not found", 404);
  if (role !== "admin" && mark.gradedBy.toString() !== userId)
    throw err("You can only edit marks you entered", 403);
  if (data.score !== undefined && data.score > mark.assessment.maxScore)
    throw err(`Score cannot exceed maxScore of ${mark.assessment.maxScore}`, 400);
  return Mark.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate("assessment").populate("student", "firstName lastName").populate("gradedBy", "name");
};

exports.remove = async (id) => {
  const mark = await Mark.findByIdAndDelete(id);
  if (!mark) throw err("Mark not found", 404);
};
