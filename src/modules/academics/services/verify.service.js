const SchoolClass = require("../models/class.model");
const { Student } = require("../../people");
const { AcademicYear } = require("../models/index");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.getPublicClassRoster = async (classId) => {
  const schoolClass = await SchoolClass.findById(classId).select("name");
  if (!schoolClass) throw err("Record not found", 404);

  const students = await Student.find({ currentClass: classId, academicStatus: "Active" })
    .select("firstName lastName EMISNo academicStatus")
    .sort({ lastName: 1 });

  // Find the most recent academic year for context
  const academicYear = await AcademicYear.findOne().sort({ start_date: -1 }).select("name");

  return {
    className: schoolClass.name,
    academicYear: academicYear?.name || null,
    students: students.map((s) => ({
      firstName: s.firstName,
      lastName: s.lastName,
      EMISNo: s.EMISNo,
      academicStatus: s.academicStatus,
    })),
  };
};
