const Student = require("../../models/student.model");
const Parent = require("../../models/parent.model");
const User = require("../../models/user.model");
const emailService = require("../../notifications/email.service");

async function createStudent(req, res, next) {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: "Student created successfully", data: student });
  } catch (err) { next(err); }
}

async function getAllStudents(req, res, next) {
  try {
    const students = await Student.find()
      .populate("currentClass")
      .populate("parents.parent")
      .populate("registeredBy", "username email");
    res.json(students);
  } catch (err) { next(err); }
}

async function getStudentById(req, res, next) {
  try {
    const student = await Student.findById(req.params.id)
      .populate("currentClass")
      .populate("parents.parent")
      .populate("registeredBy", "username email");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) { next(err); }
}

async function updateStudent(req, res, next) {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student updated successfully", data: student });
  } catch (err) { next(err); }
}

async function deleteStudent(req, res, next) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    await Parent.updateMany({ students: req.params.id }, { $pull: { students: req.params.id } });
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (err) { next(err); }
}

async function addParentToStudent(req, res, next) {
  try {
    const { studentId, parentId, relationship, isPrimaryContact } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    const parent = await Parent.findById(parentId);
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    if (student.parents.some((p) => p.parent.toString() === parentId))
      return res.status(400).json({ message: "Parent already assigned to this student" });
    student.parents.push({ parent: parentId, relationship: relationship || parent.relationship, isPrimaryContact: isPrimaryContact || false });
    if (isPrimaryContact) student.parents.forEach((p) => { if (p.parent.toString() !== parentId) p.isPrimaryContact = false; });
    await student.save();
    if (!parent.students.includes(studentId)) { parent.students.push(studentId); await parent.save(); }
    res.json({ message: "Parent added to student successfully", data: student });
  } catch (err) { next(err); }
}

async function removeParentFromStudent(req, res, next) {
  try {
    const { studentId, parentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    const idx = student.parents.findIndex((p) => p.parent.toString() === parentId);
    if (idx === -1) return res.status(400).json({ message: "Parent not assigned to this student" });
    student.parents.splice(idx, 1);
    await student.save();
    await Parent.findByIdAndUpdate(parentId, { $pull: { students: studentId } });
    res.json({ message: "Parent removed from student successfully", data: student });
  } catch (err) { next(err); }
}

async function getStudentsByClass(req, res, next) {
  try {
    const students = await Student.find({ currentClass: req.params.classId })
      .populate("parents.parent")
      .populate("currentClass");
    res.json(students);
  } catch (err) { next(err); }
}

async function getStudentsByStatus(req, res, next) {
  try {
    const students = await Student.find({ academicStatus: req.params.status })
      .populate("parents.parent")
      .populate("currentClass");
    res.json(students);
  } catch (err) { next(err); }
}

async function updatePrimaryContact(req, res, next) {
  try {
    const { studentId, parentId } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!student.parents.some((p) => p.parent.toString() === parentId))
      return res.status(400).json({ message: "Parent not assigned to this student" });
    student.parents.forEach((p) => { p.isPrimaryContact = p.parent.toString() === parentId; });
    await student.save();
    res.json({ message: "Primary contact updated successfully", data: student });
  } catch (err) { next(err); }
}

async function createStudentWithAccount(req, res, next) {
  try {
    const { studentData, userData } = req.body;
    if (!studentData) return res.status(400).json({ message: "studentData is required" });
    const student = new Student(studentData);
    await student.save();
    if (userData) {
      const { name, email } = userData;
      if (!name || !email) return res.status(400).json({ message: "name and email are required for user account" });
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "A user account with this email already exists" });
      const user = new User({ name, email, role: "student", student_id: student._id });
      await user.save();
      emailService.sendWelcomeEmail({ email, name }).catch((err) => console.error("[Student] Welcome email failed:", err.message));
    }
    res.status(201).json({ message: "Student created successfully with user account", data: { student, hasAccount: !!userData } });
  } catch (err) { next(err); }
}

module.exports = {
  createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent,
  addParentToStudent, removeParentFromStudent, getStudentsByClass, getStudentsByStatus,
  updatePrimaryContact, createStudentWithAccount,
};
