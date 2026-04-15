const Mark = require("../../models/mark.model");
const Assessment = require("../../models/assessment.model");
const Staff = require("../../models/staff.model");

const verifyTeacherAccess = async (userId, subrole, assessment) => {
  if (subrole === "admin") return true;
  const staff = await Staff.findOne({ user: userId });
  if (!staff) return false;
  const assignedClasses = staff.classes.map((c) => c.toString());
  const assignedSubjects = staff.subjects.map((s) => s.toString());
  if (subrole === "classteacher") return assignedClasses.includes(assessment.class.toString());
  return assignedClasses.includes(assessment.class.toString()) && assignedSubjects.includes(assessment.subject.toString());
};

exports.createMark = async (req, res, next) => {
  try {
    const { assessment: assessmentId, student, score, remarks } = req.body;
    const { role, subrole, userId } = req.user;
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    if (score > assessment.maxScore) return res.status(400).json({ message: `Score cannot exceed maxScore of ${assessment.maxScore}` });
    if (role !== "admin") {
      const allowed = await verifyTeacherAccess(userId, subrole, assessment);
      if (!allowed) return res.status(403).json({ message: "You are not assigned to this class/subject" });
    }
    const mark = new Mark({ assessment: assessmentId, student, score, remarks, gradedBy: userId });
    await mark.save();
    await mark.populate(["assessment", "student", "gradedBy"]);
    res.status(201).json(mark);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Mark already exists for this student and assessment" });
    next(err);
  }
};

exports.bulkCreateMarks = async (req, res, next) => {
  try {
    const { assessmentId, marks } = req.body;
    const { role, subrole, userId } = req.user;
    if (!assessmentId || !Array.isArray(marks) || marks.length === 0)
      return res.status(400).json({ message: "assessmentId and marks array are required" });
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    if (role !== "admin") {
      const allowed = await verifyTeacherAccess(userId, subrole, assessment);
      if (!allowed) return res.status(403).json({ message: "You are not assigned to this class/subject" });
    }
    const invalid = marks.filter((m) => m.score > assessment.maxScore);
    if (invalid.length > 0) return res.status(400).json({ message: `Some scores exceed maxScore of ${assessment.maxScore}` });
    const docs = marks.map((m) => ({ assessment: assessmentId, student: m.student, score: m.score, remarks: m.remarks || "", gradedBy: userId }));
    const results = await Promise.allSettled(
      docs.map((doc) => Mark.findOneAndUpdate({ assessment: doc.assessment, student: doc.student }, doc, { upsert: true, new: true, runValidators: true }))
    );
    const saved = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    res.status(201).json({ message: `${saved} marks saved, ${failed} failed`, saved, failed });
  } catch (err) { next(err); }
};

exports.getMarksByAssessment = async (req, res, next) => {
  try {
    const { role, subrole, userId } = req.user;
    const assessment = await Assessment.findById(req.params.assessmentId);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    if (role !== "admin") {
      const allowed = await verifyTeacherAccess(userId, subrole, assessment);
      if (!allowed) return res.status(403).json({ message: "You are not assigned to this class/subject" });
    }
    const marks = await Mark.find({ assessment: req.params.assessmentId })
      .populate("student", "firstName lastName currentClass").populate("gradedBy", "name").sort({ score: -1 });
    res.json(marks);
  } catch (err) { next(err); }
};

exports.getMarksByStudent = async (req, res, next) => {
  try {
    const { termId } = req.query;
    const filter = { student: req.params.studentId };
    if (termId) {
      const assessments = await Assessment.find({ academicTerm: termId }).select("_id");
      filter.assessment = { $in: assessments.map((a) => a._id) };
    }
    const marks = await Mark.find(filter)
      .populate({ path: "assessment", select: "title category type subject academicTerm maxScore date", populate: [{ path: "subject", select: "name" }, { path: "academicTerm", select: "name" }] })
      .populate("gradedBy", "name").sort({ createdAt: -1 });
    res.json(marks);
  } catch (err) { next(err); }
};

exports.updateMark = async (req, res, next) => {
  try {
    const { role, userId } = req.user;
    const mark = await Mark.findById(req.params.id).populate("assessment");
    if (!mark) return res.status(404).json({ message: "Mark not found" });
    if (role !== "admin" && mark.gradedBy.toString() !== userId)
      return res.status(403).json({ message: "You can only edit marks you entered" });
    if (req.body.score !== undefined && req.body.score > mark.assessment.maxScore)
      return res.status(400).json({ message: `Score cannot exceed maxScore of ${mark.assessment.maxScore}` });
    const updated = await Mark.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("assessment").populate("student", "firstName lastName").populate("gradedBy", "name");
    res.json(updated);
  } catch (err) { next(err); }
};

exports.deleteMark = async (req, res, next) => {
  try {
    const mark = await Mark.findByIdAndDelete(req.params.id);
    if (!mark) return res.status(404).json({ message: "Mark not found" });
    res.json({ message: "Mark deleted" });
  } catch (err) { next(err); }
};
