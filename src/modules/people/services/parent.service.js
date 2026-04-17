const Parent = require("../models/parent.model");
const { User } = require("../../auth");
const emailService = require("../../../shared/notifications");
const { uploadService } = require("../../../shared/upload");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async (data) => {
  const parent = new Parent(data);
  await parent.save();
  return parent;
};

exports.getAll = async () => Parent.find().populate("students");

exports.getById = async (id) => {
  const parent = await Parent.findById(id).populate("students");
  if (!parent) throw err("Parent not found", 404);
  return parent;
};

exports.update = async (id, data) => {
  const parent = await Parent.findByIdAndUpdate(id, data, { new: true });
  if (!parent) throw err("Parent not found", 404);
  return parent;
};

exports.remove = async (id) => {
  const parent = await Parent.findByIdAndDelete(id);
  if (!parent) throw err("Parent not found", 404);
  await User.updateMany({ parent_id: id }, { $set: { parent_id: null } });
};

exports.addStudent = async ({ parentId, studentId }) => {
  const parent = await Parent.findById(parentId);
  if (!parent) throw err("Parent not found", 404);
  if (parent.students.includes(studentId)) throw err("Student already assigned to this parent", 400);
  parent.students.push(studentId);
  await parent.save();
  return parent;
};

exports.removeStudent = async (parentId, studentId) => {
  const parent = await Parent.findById(parentId);
  if (!parent) throw err("Parent not found", 404);
  if (!parent.students.includes(studentId)) throw err("Student not assigned to this parent", 400);
  parent.students = parent.students.filter((s) => s.toString() !== studentId);
  await parent.save();
  return parent;
};

exports.getByStudent = async (studentId) => Parent.find({ students: studentId });

exports.uploadPhoto = async (id, file) => {
  const parent = await Parent.findById(id);
  if (!parent) throw err("Parent not found", 404);
  const { url } = await uploadService.uploadFile(file, {
    folder: "parents/photos",
    publicId: `parent_photo_${id}`,
    resourceType: "image",
  });
  parent.photo = url;
  await parent.save();
  return { photo: parent.photo };
};

exports.uploadIdDocument = async (id, file) => {
  const parent = await Parent.findById(id);
  if (!parent) throw err("Parent not found", 404);
  const isImage = file.mimetype.startsWith("image/");
  const { url } = await uploadService.uploadFile(file, {
    folder: "parents/id-documents",
    publicId: `parent_id_${id}`,
    resourceType: isImage ? "image" : "raw",
  });
  parent.idDocument = url;
  await parent.save();
  return { idDocument: parent.idDocument };
};

exports.createWithAccount = async ({ parentData, userData }) => {
  const parent = new Parent(parentData);
  await parent.save();
  if (userData) {
    const { name, email } = userData;
    if (!name || !email) throw err("name and email are required for user account", 400);
    const existing = await User.findOne({ email });
    if (existing) throw err("A user account with this email already exists", 400);
    const user = new User({ name, email, role: "parent", parent_id: parent._id });
    await user.save();
    emailService.sendWelcomeEmail({ email, name }).catch((e) => console.error("[Parent] Welcome email failed:", e.message));
  }
  return { parent, hasAccount: !!userData };
};
