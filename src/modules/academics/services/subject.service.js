const Subject = require("../models/subject.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async ({ name, description }) => {
  const subject = new Subject({ name, description });
  await subject.save();
  return subject;
};

exports.getAll = async () => Subject.find();

exports.getById = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) throw err("Subject not found", 404);
  return subject;
};

exports.update = async (id, { name, description }) => {
  const subject = await Subject.findByIdAndUpdate(id, { name, description }, { new: true });
  if (!subject) throw err("Subject not found", 404);
  return subject;
};

exports.remove = async (id) => {
  const subject = await Subject.findByIdAndDelete(id);
  if (!subject) throw err("Subject not found", 404);
};
