const AcademicYear = require("../models/academicYear.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async (data) => {
  const academicYear = new AcademicYear(data);
  await academicYear.save();
  return academicYear;
};

exports.getAll = async () => AcademicYear.find();

exports.getById = async (id) => {
  const academicYear = await AcademicYear.findById(id);
  if (!academicYear) throw err("Academic year not found", 404);
  return academicYear;
};

exports.update = async (id, data) => {
  const academicYear = await AcademicYear.findByIdAndUpdate(id, data, { new: true });
  if (!academicYear) throw err("Academic year not found", 404);
  return academicYear;
};

exports.remove = async (id) => {
  const academicYear = await AcademicYear.findByIdAndDelete(id);
  if (!academicYear) throw err("Academic year not found", 404);
};
