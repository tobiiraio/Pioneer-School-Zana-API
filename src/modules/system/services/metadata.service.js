const Metadata = require("../models/metadata.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async (data) => {
  const metadata = new Metadata(data);
  await metadata.save();
  return metadata;
};

exports.getAll = async () => Metadata.find();

exports.getActive = async () => {
  const metadata = await Metadata.findOne({ is_active: true });
  if (!metadata) throw err("No active metadata found", 404);
  return metadata;
};

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

exports.setActive = async (id) => {
  const metadata = await Metadata.findById(id);
  if (!metadata) throw err("Metadata not found", 404);
  await Metadata.updateMany({ _id: { $ne: id } }, { is_active: false });
  metadata.is_active = true;
  await metadata.save();
  return metadata;
};

exports.remove = async (id) => {
  const metadata = await Metadata.findByIdAndDelete(id);
  if (!metadata) throw err("Metadata not found", 404);
};
