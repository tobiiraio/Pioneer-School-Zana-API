const Staff = require("../../models/staff.model");
const User = require("../../models/user.model");
const emailService = require("../../notifications/email.service");

async function createStaff(req, res, next) {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json({ message: "Staff created successfully", data: staff });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email)
      return res.status(409).json({ message: "Staff with this email already exists" });
    next(err);
  }
}

async function getAllStaff(req, res, next) {
  try {
    const staff = await Staff.find().populate("subjects").populate("classes").populate("user", "username email role");
    res.json(staff);
  } catch (err) { next(err); }
}

async function getStaffById(req, res, next) {
  try {
    const staff = await Staff.findById(req.params.id).populate("subjects").populate("classes").populate("user", "username email role");
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (err) { next(err); }
}

async function updateStaff(req, res, next) {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff updated successfully", data: staff });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email)
      return res.status(409).json({ message: "Cannot update staff - this email is already in use" });
    next(err);
  }
}

async function deleteStaff(req, res, next) {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    if (staff.user) await User.findByIdAndUpdate(staff.user, { $unset: { staff_id: 1 } });
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: "Staff deleted successfully" });
  } catch (err) { next(err); }
}

async function getStaffByDepartment(req, res, next) {
  try {
    const staff = await Staff.find({ department: req.params.department }).populate("subjects").populate("classes");
    res.json(staff);
  } catch (err) { next(err); }
}

async function getStaffByStatus(req, res, next) {
  try {
    const staff = await Staff.find({ employmentStatus: req.params.status }).populate("subjects").populate("classes");
    res.json(staff);
  } catch (err) { next(err); }
}

async function addSubjectToTeacher(req, res, next) {
  try {
    const { staffId, subjectId } = req.body;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    if (staff.subjects.includes(subjectId)) return res.status(400).json({ message: "Subject already assigned to this teacher" });
    staff.subjects.push(subjectId);
    await staff.save();
    res.json({ message: "Subject added to teacher successfully", data: staff });
  } catch (err) { next(err); }
}

async function removeSubjectFromTeacher(req, res, next) {
  try {
    const { staffId, subjectId } = req.params;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    if (!staff.subjects.includes(subjectId)) return res.status(400).json({ message: "Subject not assigned to this teacher" });
    staff.subjects = staff.subjects.filter((s) => s.toString() !== subjectId);
    await staff.save();
    res.json({ message: "Subject removed from teacher successfully", data: staff });
  } catch (err) { next(err); }
}

async function addClassToTeacher(req, res, next) {
  try {
    const { staffId, classId } = req.body;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    if (staff.classes.includes(classId)) return res.status(400).json({ message: "Class already assigned to this teacher" });
    staff.classes.push(classId);
    await staff.save();
    res.json({ message: "Class added to teacher successfully", data: staff });
  } catch (err) { next(err); }
}

async function removeClassFromTeacher(req, res, next) {
  try {
    const { staffId, classId } = req.params;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    if (!staff.classes.includes(classId)) return res.status(400).json({ message: "Class not assigned to this teacher" });
    staff.classes = staff.classes.filter((c) => c.toString() !== classId);
    await staff.save();
    res.json({ message: "Class removed from teacher successfully", data: staff });
  } catch (err) { next(err); }
}

async function setStaffStatus(req, res, next) {
  try {
    const { employmentStatus, isActive } = req.body;
    const allowed = ["Full-time", "Part-time", "Contract", "Probation", "Suspended", "Terminated"];
    if (employmentStatus && !allowed.includes(employmentStatus))
      return res.status(400).json({ message: `employmentStatus must be one of: ${allowed.join(", ")}` });
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    if (employmentStatus !== undefined) staff.employmentStatus = employmentStatus;
    if (isActive !== undefined) staff.isActive = isActive;
    if (employmentStatus === "Suspended" || employmentStatus === "Terminated") staff.isActive = false;
    else if (employmentStatus && staff.isActive === false && isActive === undefined) staff.isActive = true;
    if (staff.user) await User.findByIdAndUpdate(staff.user, { isActive: staff.isActive });
    await staff.save();
    res.json({ message: "Staff status updated successfully", data: staff });
  } catch (err) { next(err); }
}

async function createStaffWithAccount(req, res, next) {
  try {
    const { staffData, userData } = req.body;
    const staff = new Staff(staffData);
    await staff.save();
    if (userData) {
      const { name, email, subrole } = userData;
      if (!name || !email || !subrole) return res.status(400).json({ message: "name, email and subrole are required for staff user account" });
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "A user account with this email already exists" });
      const user = new User({ name, email, role: "staff", subrole, staff_id: staff._id });
      await user.save();
      staff.user = user._id;
      await staff.save();
      emailService.sendWelcomeEmail({ email, name }).catch((err) => console.error("[Staff] Welcome email failed:", err.message));
    }
    res.status(201).json({ message: "Staff created successfully with user account", data: { staff, hasAccount: !!userData } });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email)
      return res.status(409).json({ message: "Staff with this email already exists" });
    next(err);
  }
}

async function getTeachersBySubject(req, res, next) {
  try {
    const teachers = await Staff.find({ subjects: req.params.subjectId }).populate("subjects").populate("classes");
    res.json(teachers);
  } catch (err) { next(err); }
}

async function getTeachersByClass(req, res, next) {
  try {
    const teachers = await Staff.find({ classes: req.params.classId }).populate("subjects").populate("classes");
    res.json(teachers);
  } catch (err) { next(err); }
}

module.exports = {
  createStaff, getAllStaff, getStaffById, updateStaff, deleteStaff,
  getStaffByDepartment, getStaffByStatus, setStaffStatus,
  addSubjectToTeacher, removeSubjectFromTeacher, addClassToTeacher, removeClassFromTeacher,
  createStaffWithAccount, getTeachersBySubject, getTeachersByClass,
};
