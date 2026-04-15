const Requirement = require("../models/requirement.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async (data) => {
  const requirement = new Requirement(data);
  await requirement.save();
  return requirement;
};

exports.getAll = async () => Requirement.find();

exports.getById = async (id) => {
  const requirement = await Requirement.findById(id);
  if (!requirement) throw err("Requirement not found", 404);
  return requirement;
};

exports.update = async (id, data) => {
  const requirement = await Requirement.findByIdAndUpdate(id, data, { new: true });
  if (!requirement) throw err("Requirement not found", 404);
  return requirement;
};

exports.remove = async (id) => {
  const requirement = await Requirement.findByIdAndDelete(id);
  if (!requirement) throw err("Requirement not found", 404);
};
