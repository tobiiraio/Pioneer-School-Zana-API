const Parent = require("./models/parent.model");
const { User } = require("../auth");
const emailService = require("../../notifications/email.service");

async function createParent(req, res, next) {
  try {
    const parent = new Parent(req.body);
    await parent.save();
    res.status(201).json({ message: "Parent created successfully", data: parent });
  } catch (err) { next(err); }
}

async function getAllParents(req, res, next) {
  try {
    res.json(await Parent.find().populate("students"));
  } catch (err) { next(err); }
}

async function getParentById(req, res, next) {
  try {
    const parent = await Parent.findById(req.params.id).populate("students");
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    res.json(parent);
  } catch (err) { next(err); }
}

async function updateParent(req, res, next) {
  try {
    const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    res.json({ message: "Parent updated successfully", data: parent });
  } catch (err) { next(err); }
}

async function deleteParent(req, res, next) {
  try {
    const parent = await Parent.findByIdAndDelete(req.params.id);
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    await User.updateMany({ parent_id: req.params.id }, { $set: { parent_id: null } });
    res.json({ message: "Parent deleted successfully" });
  } catch (err) { next(err); }
}

async function addStudentToParent(req, res, next) {
  try {
    const { parentId, studentId } = req.body;
    const parent = await Parent.findById(parentId);
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    if (parent.students.includes(studentId)) return res.status(400).json({ message: "Student already assigned to this parent" });
    parent.students.push(studentId);
    await parent.save();
    res.json({ message: "Student added to parent successfully", data: parent });
  } catch (err) { next(err); }
}

async function removeStudentFromParent(req, res, next) {
  try {
    const { parentId, studentId } = req.params;
    const parent = await Parent.findById(parentId);
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    if (!parent.students.includes(studentId)) return res.status(400).json({ message: "Student not assigned to this parent" });
    parent.students = parent.students.filter((s) => s.toString() !== studentId);
    await parent.save();
    res.json({ message: "Student removed from parent successfully", data: parent });
  } catch (err) { next(err); }
}

async function getParentsByStudentId(req, res, next) {
  try {
    res.json(await Parent.find({ students: req.params.studentId }));
  } catch (err) { next(err); }
}

async function createParentWithAccount(req, res, next) {
  try {
    const { parentData, userData } = req.body;
    const parent = new Parent(parentData);
    await parent.save();
    if (userData) {
      const { name, email } = userData;
      if (!name || !email) return res.status(400).json({ message: "name and email are required for user account" });
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "A user account with this email already exists" });
      const user = new User({ name, email, role: "parent", parent_id: parent._id });
      await user.save();
      emailService.sendWelcomeEmail({ email, name }).catch((err) => console.error("[Parent] Welcome email failed:", err.message));
    }
    res.status(201).json({ message: "Parent created successfully with user account", data: { parent, hasAccount: !!userData } });
  } catch (err) { next(err); }
}

module.exports = {
  createParent, getAllParents, getParentById, updateParent, deleteParent,
  addStudentToParent, removeStudentFromParent, getParentsByStudentId, createParentWithAccount,
};
