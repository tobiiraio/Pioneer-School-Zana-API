const Metadata = require("../models/metadata.model");
const { uploadService } = require("../../../shared/upload");

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

exports.uploadLogo = async (id, file) => {
  const metadata = await Metadata.findById(id);
  if (!metadata) throw err("Metadata not found", 404);
  const { url } = await uploadService.uploadFile(file, {
    folder: "school/logo",
    publicId: `school_logo_${id}`,
    resourceType: "image",
  });
  metadata.logo_url = url;
  await metadata.save();
  return { logo_url: metadata.logo_url };
};

exports.remove = async (id) => {
  const metadata = await Metadata.findByIdAndDelete(id);
  if (!metadata) throw err("Metadata not found", 404);
};
