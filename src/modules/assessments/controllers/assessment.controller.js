const Assessment = require("../models/assessment.model");
const { Staff } = require("../../people");

exports.createAssessment = async (req, res, next) => {
  try {
    const { title, category, type, academicYear, academicTerm, class: classId, subject, maxScore, date } = req.body;
    const assessment = new Assessment({ title, category, type, academicYear, academicTerm, class: classId, subject, maxScore, date, createdBy: req.user.userId });
    await assessment.save();
    await assessment.populate(["academicYear", "academicTerm", "class", "subject", "createdBy"]);
    res.status(201).json(assessment);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "An assessment for this category, class, subject and term already exists" });
    next(err);
  }
};

exports.getAssessments = async (req, res, next) => {
  try {
    const { role, subrole, userId } = req.user;
    const { termId, classId, subjectId } = req.query;
    const filter = {};
    if (termId) filter.academicTerm = termId;
    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;
    if (subrole === "teacher" || subrole === "classteacher") {
      const staff = await Staff.findOne({ user: userId });
      if (!staff) return res.status(403).json({ message: "Staff record not found" });
      if (subrole === "teacher") { filter.class = { $in: staff.classes }; filter.subject = { $in: staff.subjects }; }
      else { filter.class = { $in: staff.classes }; }
    }
    const assessments = await Assessment.find(filter)
      .populate("academicYear", "name").populate("academicTerm", "name")
      .populate("class", "name shortName").populate("subject", "name").populate("createdBy", "name")
      .sort({ date: -1 });
    res.json(assessments);
  } catch (err) { next(err); }
};

exports.getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate("academicYear", "name").populate("academicTerm", "name")
      .populate("class", "name shortName").populate("subject", "name").populate("createdBy", "name");
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  } catch (err) { next(err); }
};

exports.getAssessmentsByClass = async (req, res, next) => {
  try {
    const { termId } = req.query;
    const filter = { class: req.params.classId };
    if (termId) filter.academicTerm = termId;
    const assessments = await Assessment.find(filter).populate("academicTerm", "name").populate("subject", "name").sort({ date: 1 });
    res.json(assessments);
  } catch (err) { next(err); }
};

exports.getAssessmentsByTerm = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const filter = { academicTerm: req.params.termId };
    if (classId) filter.class = classId;
    const assessments = await Assessment.find(filter).populate("class", "name shortName").populate("subject", "name").sort({ date: 1 });
    res.json(assessments);
  } catch (err) { next(err); }
};

exports.updateAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate(["academicYear", "academicTerm", "class", "subject"]);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "An assessment for this category, class, subject and term already exists" });
    next(err);
  }
};

exports.deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json({ message: "Assessment deleted" });
  } catch (err) { next(err); }
};
