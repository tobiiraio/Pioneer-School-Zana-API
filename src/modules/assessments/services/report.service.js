const Mark = require("../models/mark.model");
const Assessment = require("../models/assessment.model");
const { Student, Staff } = require("../../people");
const { Metadata } = require("../../system");
const { Grade } = require("../../grades");

const err = (msg, status) => Object.assign(new Error(msg), { status });

// Resolve grade in-memory from a pre-fetched sorted scale — avoids N+1 DB queries.
const resolveGrade = (score, maxScore, scale) => {
  if (score == null || !maxScore || !scale.length) return null;
  const pct = (score / maxScore) * 100;
  const grade = scale.find((g) => pct >= g.minScore && pct <= g.maxScore);
  return grade ? { label: grade.label, remark: grade.remark, points: grade.points } : null;
};

const buildStudentReport = (student, assessments, marks, position, totalStudents, scale) => {
  const subjectMap = {};
  let totalScore = 0;
  let totalMaxScore = 0;

  for (const assessment of assessments) {
    const subjectId = assessment.subject._id.toString();
    if (!subjectMap[subjectId]) subjectMap[subjectId] = { subject: assessment.subject.name, scores: {} };
    const mark = marks.find((m) => m.assessment._id.toString() === assessment._id.toString());
    const score = mark ? mark.score : null;
    if (score != null) { totalScore += score; totalMaxScore += assessment.maxScore; }
    subjectMap[subjectId].scores[assessment.category] = {
      assessmentId: assessment._id,
      title: assessment.title,
      maxScore: assessment.maxScore,
      score,
      remarks: mark ? mark.remarks : null,
      grade: score != null ? resolveGrade(score, assessment.maxScore, scale) : null,
    };
  }

  return {
    student: {
      id: student._id,
      fullName: `${student.firstName} ${student.lastName}${student.otherName ? " " + student.otherName : ""}`,
      class: student.currentClass,
    },
    subjects: Object.values(subjectMap),
    totalScore,
    totalMaxScore,
    overallGrade: totalMaxScore > 0 ? resolveGrade(totalScore, totalMaxScore, scale) : null,
    position: position || null,
    totalStudents: totalStudents || null,
  };
};

const calculatePositions = (studentScores) => {
  const sorted = [...studentScores].sort((a, b) => b.total - a.total);
  const positions = {};
  sorted.forEach((s, i) => { positions[s.studentId] = i + 1; });
  return positions;
};

exports.getStudentReport = async (studentId, termId) => {
  const [student, scale] = await Promise.all([
    Student.findById(studentId).populate("currentClass", "name shortName"),
    Grade.find().sort({ minScore: 1 }),
  ]);
  if (!student) throw err("Student not found", 404);
  const assessments = await Assessment.find({ class: student.currentClass._id, academicTerm: termId })
    .populate("subject", "name").populate("academicTerm", "name").populate("academicYear", "name")
    .sort({ "subject.name": 1, category: 1 });
  if (!assessments.length) throw err("No assessments found for this class and term", 404);
  const marks = await Mark.find({ student: studentId, assessment: { $in: assessments.map((a) => a._id) } }).populate("assessment");
  const classStudents = await Student.find({ currentClass: student.currentClass._id }).select("_id");
  const allMarks = await Mark.find({ assessment: { $in: assessments.map((a) => a._id) }, student: { $in: classStudents.map((s) => s._id) } });
  const studentTotals = {};
  for (const m of allMarks) { const sid = m.student.toString(); studentTotals[sid] = (studentTotals[sid] || 0) + m.score; }
  const positions = calculatePositions(Object.entries(studentTotals).map(([sid, total]) => ({ studentId: sid, total })));
  const metadata = await Metadata.findOne({ is_active: true });
  const report = buildStudentReport(student, assessments, marks, positions[studentId] || null, classStudents.length, scale);
  return { school: metadata || null, term: assessments[0]?.academicTerm || null, academicYear: assessments[0]?.academicYear || null, ...report };
};

exports.getClassReport = async (classId, termId, { subrole, userId } = {}) => {
  if (subrole === "classteacher") {
    const staff = await Staff.findOne({ user: userId });
    if (!staff) throw err("Staff record not found", 403);
    if (!staff.classes.map((c) => c.toString()).includes(classId))
      throw err("You are not assigned to this class", 403);
  }
  const [assessments, scale] = await Promise.all([
    Assessment.find({ class: classId, academicTerm: termId })
      .populate("subject", "name").populate("academicTerm", "name").populate("academicYear", "name")
      .sort({ "subject.name": 1, category: 1 }),
    Grade.find().sort({ minScore: 1 }),
  ]);
  if (!assessments.length) throw err("No assessments found for this class and term", 404);
  const students = await Student.find({ currentClass: classId, academicStatus: "Active" })
    .populate("currentClass", "name shortName").sort({ lastName: 1 });
  if (!students.length) throw err("No active students in this class", 404);
  const allMarks = await Mark.find({ assessment: { $in: assessments.map((a) => a._id) }, student: { $in: students.map((s) => s._id) } }).populate("assessment");
  const studentTotals = {};
  for (const m of allMarks) { const sid = m.student.toString(); studentTotals[sid] = (studentTotals[sid] || 0) + m.score; }
  const positions = calculatePositions(Object.entries(studentTotals).map(([sid, total]) => ({ studentId: sid, total })));
  const metadata = await Metadata.findOne({ is_active: true });
  const reports = students.map((student) => {
    const studentMarks = allMarks.filter((m) => m.student.toString() === student._id.toString());
    return buildStudentReport(student, assessments, studentMarks, positions[student._id.toString()] || null, students.length, scale);
  });
  reports.sort((a, b) => (a.position || 999) - (b.position || 999));
  return { school: metadata || null, term: assessments[0]?.academicTerm || null, academicYear: assessments[0]?.academicYear || null, class: { id: classId }, totalStudents: students.length, reports };
};
