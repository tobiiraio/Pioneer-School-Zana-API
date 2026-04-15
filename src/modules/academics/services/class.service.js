const SchoolClass = require("../models/class.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async (data) => {
  const schoolClass = new SchoolClass(data);
  await schoolClass.save();
  return schoolClass;
};

exports.getAll = async () => SchoolClass.find();

exports.getById = async (id) => {
  const schoolClass = await SchoolClass.findById(id);
  if (!schoolClass) throw err("Class not found", 404);
  return schoolClass;
};

exports.update = async (id, data) => {
  const schoolClass = await SchoolClass.findByIdAndUpdate(id, data, { new: true });
  if (!schoolClass) throw err("Class not found", 404);
  return schoolClass;
};

exports.remove = async (id) => {
  const schoolClass = await SchoolClass.findByIdAndDelete(id);
  if (!schoolClass) throw err("Class not found", 404);
};
