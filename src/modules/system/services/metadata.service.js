const Metadata = require("../models/metadata.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async (data) => {
  const metadata = new Metadata(data);
  await metadata.save();
  return metadata;
};

exports.getAll = async () => Metadata.find();

exports.getById = async (id) => {
  const metadata = await Metadata.findById(id);
  if (!metadata) throw err("Metadata not found", 404);
  return metadata;
};

exports.update = async (id, data) => {
  const metadata = await Metadata.findByIdAndUpdate(id, data, { new: true });
  if (!metadata) throw err("Metadata not found", 404);
  return metadata;
};

exports.remove = async (id) => {
  const metadata = await Metadata.findByIdAndDelete(id);
  if (!metadata) throw err("Metadata not found", 404);
};
