const Assessment = require("../models/assessment.model");
const { Staff } = require("../../people");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async (data, userId) => {
  const { title, category, type, academicYear, academicTerm, class: classId, subject, maxScore, date } = data;
  try {
    const assessment = new Assessment({ title, category, type, academicYear, academicTerm, class: classId, subject, maxScore, date, createdBy: userId });
    await assessment.save();
    await assessment.populate(["academicYear", "academicTerm", "class", "subject", "createdBy"]);
    return assessment;
  } catch (e) {
    if (e.code === 11000) throw err("An assessment for this category, class, subject and term already exists", 400);
    throw e;
  }
};

exports.getAll = async ({ termId, classId, subjectId } = {}, { role, subrole, userId } = {}) => {
  const filter = {};
  if (termId) filter.academicTerm = termId;
  if (classId) filter.class = classId;
  if (subjectId) filter.subject = subjectId;
  if (subrole === "teacher" || subrole === "classteacher") {
    const staff = await Staff.findOne({ user: userId });
    if (!staff) throw err("Staff record not found", 403);
    if (subrole === "teacher") { filter.class = { $in: staff.classes }; filter.subject = { $in: staff.subjects }; }
    else { filter.class = { $in: staff.classes }; }
  }
  return Assessment.find(filter)
    .populate("academicYear", "name").populate("academicTerm", "name")
    .populate("class", "name shortName").populate("subject", "name").populate("createdBy", "name")
    .sort({ date: -1 });
};

exports.getById = async (id) => {
  const assessment = await Assessment.findById(id)
    .populate("academicYear", "name").populate("academicTerm", "name")
    .populate("class", "name shortName").populate("subject", "name").populate("createdBy", "name");
  if (!assessment) throw err("Assessment not found", 404);
  return assessment;
};

exports.getByClass = async (classId, termId) => {
  const filter = { class: classId };
  if (termId) filter.academicTerm = termId;
  return Assessment.find(filter).populate("academicTerm", "name").populate("subject", "name").sort({ date: 1 });
};

exports.getByTerm = async (termId, classId) => {
  const filter = { academicTerm: termId };
  if (classId) filter.class = classId;
  return Assessment.find(filter).populate("class", "name shortName").populate("subject", "name").sort({ date: 1 });
};

exports.update = async (id, data) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate(["academicYear", "academicTerm", "class", "subject"]);
    if (!assessment) throw err("Assessment not found", 404);
    return assessment;
  } catch (e) {
    if (e.code === 11000) throw err("An assessment for this category, class, subject and term already exists", 400);
    throw e;
  }
};

exports.remove = async (id) => {
  const assessment = await Assessment.findByIdAndDelete(id);
  if (!assessment) throw err("Assessment not found", 404);
};
