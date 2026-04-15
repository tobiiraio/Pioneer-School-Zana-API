const Mark = require("../models/mark.model");
const Assessment = require("../models/assessment.model");
const Student = require("../models/student.model");
const Metadata = require("../models/metadata.model");
const Staff = require("../models/staff.model");

// Build the report grid for a single student in a term
const buildStudentReport = (student, assessments, marks, position, totalStudents) => {
  // Group assessments by subject
  const subjectMap = {};

  for (const assessment of assessments) {
    const subjectId = assessment.subject._id.toString();
    const subjectName = assessment.subject.name;

    if (!subjectMap[subjectId]) {
      subjectMap[subjectId] = { subject: subjectName, scores: {} };
    }

    // Find this student's mark for this assessment
    const mark = marks.find(
      (m) => m.assessment._id.toString() === assessment._id.toString()
    );

    subjectMap[subjectId].scores[assessment.category] = {
      assessmentId: assessment._id,
      title: assessment.title,
      maxScore: assessment.maxScore,
      score: mark ? mark.score : null,
      remarks: mark ? mark.remarks : null,
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

// Calculate position of each student in class for a given term
const calculatePositions = (studentScores) => {
  // studentScores: [{ studentId, total }]
  const sorted = [...studentScores].sort((a, b) => b.total - a.total);
  const positions = {};
  sorted.forEach((s, i) => {
    positions[s.studentId] = i + 1;
  });
  return positions;
};

// GET /reports/student/:studentId/term/:termId
exports.getStudentReport = async (req, res) => {
  try {
    const { studentId, termId } = req.params;

    const student = await Student.findById(studentId).populate("currentClass", "name shortName");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // All assessments for this class in this term
    const assessments = await Assessment.find({
      class: student.currentClass._id,
      academicTerm: termId,
    })
      .populate("subject", "name")
      .populate("academicTerm", "name")
      .populate("academicYear", "name")
      .sort({ "subject.name": 1, category: 1 });

    if (!assessments.length) {
      return res.status(404).json({ message: "No assessments found for this class and term" });
    }

    // Marks for this student
    const marks = await Mark.find({
      student: studentId,
      assessment: { $in: assessments.map((a) => a._id) },
    }).populate("assessment");

    // Calculate position — need all students' marks in same class+term
    const classStudents = await Student.find({ currentClass: student.currentClass._id }).select("_id");
    const allMarks = await Mark.find({
      assessment: { $in: assessments.map((a) => a._id) },
      student: { $in: classStudents.map((s) => s._id) },
    });

    // Sum scores per student
    const studentTotals = {};
    for (const m of allMarks) {
      const sid = m.student.toString();
      studentTotals[sid] = (studentTotals[sid] || 0) + m.score;
    }

    const studentScores = Object.entries(studentTotals).map(([sid, total]) => ({
      studentId: sid, total,
    }));
    const positions = calculatePositions(studentScores);

    // School metadata for report header
    const metadata = await Metadata.findOne();

    const report = buildStudentReport(
      student,
      assessments,
      marks,
      positions[studentId] || null,
      classStudents.length
    );

    res.json({
      school: metadata || null,
      term: assessments[0]?.academicTerm || null,
      academicYear: assessments[0]?.academicYear || null,
      ...report,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /reports/class/:classId/term/:termId  — all students in a class
exports.getClassReport = async (req, res) => {
  try {
    const { classId, termId } = req.params;
    const { role, subrole, userId } = req.user;

    // Classteacher scope check
    if (subrole === "classteacher") {
      const staff = await Staff.findOne({ user: userId });
      if (!staff) return res.status(403).json({ message: "Staff record not found" });
      const assignedClasses = staff.classes.map((c) => c.toString());
      if (!assignedClasses.includes(classId)) {
        return res.status(403).json({ message: "You are not assigned to this class" });
      }
    }

    const assessments = await Assessment.find({ class: classId, academicTerm: termId })
      .populate("subject", "name")
      .populate("academicTerm", "name")
      .populate("academicYear", "name")
      .sort({ "subject.name": 1, category: 1 });

    if (!assessments.length) {
      return res.status(404).json({ message: "No assessments found for this class and term" });
    }

    const students = await Student.find({ currentClass: classId, academicStatus: "Active" })
      .populate("currentClass", "name shortName")
      .sort({ lastName: 1 });

    if (!students.length) {
      return res.status(404).json({ message: "No active students in this class" });
    }

    const allMarks = await Mark.find({
      assessment: { $in: assessments.map((a) => a._id) },
      student: { $in: students.map((s) => s._id) },
    }).populate("assessment");

    // Calculate positions
    const studentTotals = {};
    for (const m of allMarks) {
      const sid = m.student.toString();
      studentTotals[sid] = (studentTotals[sid] || 0) + m.score;
    }
    const studentScores = Object.entries(studentTotals).map(([sid, total]) => ({ studentId: sid, total }));
    const positions = calculatePositions(studentScores);

    const metadata = await Metadata.findOne();

    const reports = students.map((student) => {
      const studentMarks = allMarks.filter(
        (m) => m.student.toString() === student._id.toString()
      );
      return buildStudentReport(
        student,
        assessments,
        studentMarks,
        positions[student._id.toString()] || null,
        students.length
      );
    });

    // Sort by position
    reports.sort((a, b) => (a.position || 999) - (b.position || 999));

    res.json({
      school: metadata || null,
      term: assessments[0]?.academicTerm || null,
      academicYear: assessments[0]?.academicYear || null,
      class: { id: classId },
      totalStudents: students.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
