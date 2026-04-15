const Mark = require("./models/mark.model");
const Assessment = require("./models/assessment.model");
const { Student, Staff } = require("../people");
const { Metadata } = require("../system");

const buildStudentReport = (student, assessments, marks, position, totalStudents) => {
  const subjectMap = {};
  for (const assessment of assessments) {
    const subjectId = assessment.subject._id.toString();
    if (!subjectMap[subjectId]) subjectMap[subjectId] = { subject: assessment.subject.name, scores: {} };
    const mark = marks.find((m) => m.assessment._id.toString() === assessment._id.toString());
    subjectMap[subjectId].scores[assessment.category] = {
      assessmentId: assessment._id, title: assessment.title, maxScore: assessment.maxScore,
      score: mark ? mark.score : null, remarks: mark ? mark.remarks : null,
    };
  }
  return {
    student: {
      id: student._id,
      fullName: `${student.firstName} ${student.lastName}${student.otherName ? " " + student.otherName : ""}`,
      class: student.currentClass,
    },
    subjects: Object.values(subjectMap),
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

exports.getStudentReport = async (req, res, next) => {
  try {
    const { studentId, termId } = req.params;
    const student = await Student.findById(studentId).populate("currentClass", "name shortName");
    if (!student) return res.status(404).json({ message: "Student not found" });
    const assessments = await Assessment.find({ class: student.currentClass._id, academicTerm: termId })
      .populate("subject", "name").populate("academicTerm", "name").populate("academicYear", "name")
      .sort({ "subject.name": 1, category: 1 });
    if (!assessments.length) return res.status(404).json({ message: "No assessments found for this class and term" });
    const marks = await Mark.find({ student: studentId, assessment: { $in: assessments.map((a) => a._id) } }).populate("assessment");
    const classStudents = await Student.find({ currentClass: student.currentClass._id }).select("_id");
    const allMarks = await Mark.find({ assessment: { $in: assessments.map((a) => a._id) }, student: { $in: classStudents.map((s) => s._id) } });
    const studentTotals = {};
    for (const m of allMarks) { const sid = m.student.toString(); studentTotals[sid] = (studentTotals[sid] || 0) + m.score; }
    const positions = calculatePositions(Object.entries(studentTotals).map(([sid, total]) => ({ studentId: sid, total })));
    const metadata = await Metadata.findOne();
    const report = buildStudentReport(student, assessments, marks, positions[studentId] || null, classStudents.length);
    res.json({ school: metadata || null, term: assessments[0]?.academicTerm || null, academicYear: assessments[0]?.academicYear || null, ...report });
  } catch (err) { next(err); }
};

exports.getClassReport = async (req, res, next) => {
  try {
    const { classId, termId } = req.params;
    const { subrole, userId } = req.user;
    if (subrole === "classteacher") {
      const staff = await Staff.findOne({ user: userId });
      if (!staff) return res.status(403).json({ message: "Staff record not found" });
      if (!staff.classes.map((c) => c.toString()).includes(classId))
        return res.status(403).json({ message: "You are not assigned to this class" });
    }
    const assessments = await Assessment.find({ class: classId, academicTerm: termId })
      .populate("subject", "name").populate("academicTerm", "name").populate("academicYear", "name")
      .sort({ "subject.name": 1, category: 1 });
    if (!assessments.length) return res.status(404).json({ message: "No assessments found for this class and term" });
    const students = await Student.find({ currentClass: classId, academicStatus: "Active" }).populate("currentClass", "name shortName").sort({ lastName: 1 });
    if (!students.length) return res.status(404).json({ message: "No active students in this class" });
    const allMarks = await Mark.find({ assessment: { $in: assessments.map((a) => a._id) }, student: { $in: students.map((s) => s._id) } }).populate("assessment");
    const studentTotals = {};
    for (const m of allMarks) { const sid = m.student.toString(); studentTotals[sid] = (studentTotals[sid] || 0) + m.score; }
    const positions = calculatePositions(Object.entries(studentTotals).map(([sid, total]) => ({ studentId: sid, total })));
    const metadata = await Metadata.findOne();
    const reports = students.map((student) => {
      const studentMarks = allMarks.filter((m) => m.student.toString() === student._id.toString());
      return buildStudentReport(student, assessments, studentMarks, positions[student._id.toString()] || null, students.length);
    });
    reports.sort((a, b) => (a.position || 999) - (b.position || 999));
    res.json({ school: metadata || null, term: assessments[0]?.academicTerm || null, academicYear: assessments[0]?.academicYear || null, class: { id: classId }, totalStudents: students.length, reports });
  } catch (err) { next(err); }
};
