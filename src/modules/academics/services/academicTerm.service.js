const AcademicTerm = require("../models/academicTerm.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async (data) => {
  const academicTerm = new AcademicTerm(data);
  await academicTerm.save();
  return academicTerm;
};

exports.getAll = async () => AcademicTerm.find().populate("academic_year_id");

exports.getById = async (id) => {
  const academicTerm = await AcademicTerm.findById(id).populate("academic_year_id");
  if (!academicTerm) throw err("Academic term not found", 404);
  return academicTerm;
};

exports.update = async (id, data) => {
  const academicTerm = await AcademicTerm.findByIdAndUpdate(id, data, { new: true });
  if (!academicTerm) throw err("Academic term not found", 404);
  return academicTerm;
};

exports.remove = async (id) => {
  const academicTerm = await AcademicTerm.findByIdAndDelete(id);
  if (!academicTerm) throw err("Academic term not found", 404);
};
