const Student = require("../models/student.model");
const Parent = require("../models/parent.model");
const { User } = require("../../auth");
const emailService = require("../../../shared/notifications");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async (data) => {
  const student = new Student(data);
  await student.save();
  return student;
};

exports.getAll = async () =>
  Student.find()
    .populate("currentClass")
    .populate("parents.parent")
    .populate("registeredBy", "username email");

exports.getById = async (id) => {
  const student = await Student.findById(id)
    .populate("currentClass")
    .populate("parents.parent")
    .populate("registeredBy", "username email");
  if (!student) throw err("Student not found", 404);
  return student;
};

exports.update = async (id, data) => {
  const student = await Student.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!student) throw err("Student not found", 404);
  return student;
};

exports.remove = async (id) => {
  const student = await Student.findById(id);
  if (!student) throw err("Student not found", 404);
  await Parent.updateMany({ students: id }, { $pull: { students: id } });
  await Student.findByIdAndDelete(id);
};

exports.addParent = async ({ studentId, parentId, relationship, isPrimaryContact }) => {
  const student = await Student.findById(studentId);
  if (!student) throw err("Student not found", 404);
  const parent = await Parent.findById(parentId);
  if (!parent) throw err("Parent not found", 404);
  if (student.parents.some((p) => p.parent.toString() === parentId))
    throw err("Parent already assigned to this student", 400);
  student.parents.push({ parent: parentId, relationship: relationship || parent.relationship, isPrimaryContact: isPrimaryContact || false });
  if (isPrimaryContact) student.parents.forEach((p) => { if (p.parent.toString() !== parentId) p.isPrimaryContact = false; });
  await student.save();
  if (!parent.students.includes(studentId)) { parent.students.push(studentId); await parent.save(); }
  return student;
};

exports.removeParent = async (studentId, parentId) => {
  const student = await Student.findById(studentId);
  if (!student) throw err("Student not found", 404);
  const idx = student.parents.findIndex((p) => p.parent.toString() === parentId);
  if (idx === -1) throw err("Parent not assigned to this student", 400);
  student.parents.splice(idx, 1);
  await student.save();
  await Parent.findByIdAndUpdate(parentId, { $pull: { students: studentId } });
  return student;
};

exports.getByClass = async (classId) =>
  Student.find({ currentClass: classId }).populate("parents.parent").populate("currentClass");

exports.getByStatus = async (status) =>
  Student.find({ academicStatus: status }).populate("parents.parent").populate("currentClass");

exports.updatePrimaryContact = async ({ studentId, parentId }) => {
  const student = await Student.findById(studentId);
  if (!student) throw err("Student not found", 404);
  if (!student.parents.some((p) => p.parent.toString() === parentId))
    throw err("Parent not assigned to this student", 400);
  student.parents.forEach((p) => { p.isPrimaryContact = p.parent.toString() === parentId; });
  await student.save();
  return student;
};

exports.createWithAccount = async ({ studentData, userData }) => {
  if (!studentData) throw err("studentData is required", 400);
  const student = new Student(studentData);
  await student.save();
  if (userData) {
    const { name, email } = userData;
    if (!name || !email) throw err("name and email are required for user account", 400);
    const existing = await User.findOne({ email });
    if (existing) throw err("A user account with this email already exists", 400);
    const user = new User({ name, email, role: "student", student_id: student._id });
    await user.save();
    emailService.sendWelcomeEmail({ email, name }).catch((e) => console.error("[Student] Welcome email failed:", e.message));
  }
  return { student, hasAccount: !!userData };
};
