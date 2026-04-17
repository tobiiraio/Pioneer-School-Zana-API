const Staff = require("../models/staff.model");
const { User } = require("../../auth");
const emailService = require("../../../shared/notifications");
const { uploadService } = require("../../../shared/upload");

const err = (msg, status) => Object.assign(new Error(msg), { status });
const dupEmailErr = () => err("Staff with this email already exists", 409);
const dupUpdateEmailErr = () => err("Cannot update staff - this email is already in use", 409);

exports.create = async (data) => {
  try {
    const staff = new Staff(data);
    await staff.save();
    return staff;
  } catch (e) {
    if (e.code === 11000 && e.keyPattern?.email) throw dupEmailErr();
    throw e;
  }
};

exports.getAll = async () =>
  Staff.find().populate("subjects").populate("classes").populate("user", "username email role");

exports.getById = async (id) => {
  const staff = await Staff.findById(id).populate("subjects").populate("classes").populate("user", "username email role");
  if (!staff) throw err("Staff not found", 404);
  return staff;
};

exports.update = async (id, data) => {
  try {
    const staff = await Staff.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!staff) throw err("Staff not found", 404);
    return staff;
  } catch (e) {
    if (e.code === 11000 && e.keyPattern?.email) throw dupUpdateEmailErr();
    throw e;
  }
};

exports.remove = async (id) => {
  const staff = await Staff.findById(id);
  if (!staff) throw err("Staff not found", 404);
  if (staff.user) await User.findByIdAndUpdate(staff.user, { $unset: { staff_id: 1 } });
  await Staff.findByIdAndDelete(id);
};

exports.getByDepartment = async (department) =>
  Staff.find({ department }).populate("subjects").populate("classes");

exports.getByStatus = async (status) =>
  Staff.find({ employmentStatus: status }).populate("subjects").populate("classes");

exports.addSubject = async ({ staffId, subjectId }) => {
  const staff = await Staff.findById(staffId);
  if (!staff) throw err("Staff not found", 404);
  if (staff.subjects.includes(subjectId)) throw err("Subject already assigned to this teacher", 400);
  staff.subjects.push(subjectId);
  await staff.save();
  return staff;
};

exports.removeSubject = async (staffId, subjectId) => {
  const staff = await Staff.findById(staffId);
  if (!staff) throw err("Staff not found", 404);
  if (!staff.subjects.includes(subjectId)) throw err("Subject not assigned to this teacher", 400);
  staff.subjects = staff.subjects.filter((s) => s.toString() !== subjectId);
  await staff.save();
  return staff;
};

exports.addClass = async ({ staffId, classId }) => {
  const staff = await Staff.findById(staffId);
  if (!staff) throw err("Staff not found", 404);
  if (staff.classes.includes(classId)) throw err("Class already assigned to this teacher", 400);
  staff.classes.push(classId);
  await staff.save();
  return staff;
};

exports.removeClass = async (staffId, classId) => {
  const staff = await Staff.findById(staffId);
  if (!staff) throw err("Staff not found", 404);
  if (!staff.classes.includes(classId)) throw err("Class not assigned to this teacher", 400);
  staff.classes = staff.classes.filter((c) => c.toString() !== classId);
  await staff.save();
  return staff;
};

exports.setStatus = async (id, { employmentStatus, isActive }) => {
  const allowed = ["Full-time", "Part-time", "Contract", "Probation", "Suspended", "Terminated"];
  if (employmentStatus && !allowed.includes(employmentStatus))
    throw err(`employmentStatus must be one of: ${allowed.join(", ")}`, 400);
  const staff = await Staff.findById(id);
  if (!staff) throw err("Staff not found", 404);
  if (employmentStatus !== undefined) staff.employmentStatus = employmentStatus;
  if (isActive !== undefined) staff.isActive = isActive;
  if (employmentStatus === "Suspended" || employmentStatus === "Terminated") staff.isActive = false;
  else if (employmentStatus && staff.isActive === false && isActive === undefined) staff.isActive = true;
  if (staff.user) await User.findByIdAndUpdate(staff.user, { isActive: staff.isActive });
  await staff.save();
  return staff;
};

exports.uploadPhoto = async (id, file) => {
  const staff = await Staff.findById(id);
  if (!staff) throw err("Staff not found", 404);
  const { url } = await uploadService.uploadFile(file, {
    folder: "staff/photos",
    publicId: `staff_photo_${id}`,
    resourceType: "image",
  });
  staff.photo = url;
  await staff.save();
  return { photo: staff.photo };
};

exports.uploadIdDocument = async (id, file) => {
  const staff = await Staff.findById(id);
  if (!staff) throw err("Staff not found", 404);
  const isImage = file.mimetype.startsWith("image/");
  const { url } = await uploadService.uploadFile(file, {
    folder: "staff/id-documents",
    publicId: `staff_id_${id}`,
    resourceType: isImage ? "image" : "raw",
  });
  staff.idDocument = url;
  await staff.save();
  return { idDocument: staff.idDocument };
};

exports.createWithAccount = async ({ staffData, userData }) => {
  try {
    const staff = new Staff(staffData);
    await staff.save();
    if (userData) {
      const { name, email, subrole } = userData;
      if (!name || !email || !subrole) throw err("name, email and subrole are required for staff user account", 400);
      const existing = await User.findOne({ email });
      if (existing) throw err("A user account with this email already exists", 400);
      const user = new User({ name, email, role: "staff", subrole, staff_id: staff._id });
      await user.save();
      staff.user = user._id;
      await staff.save();
      emailService.sendWelcomeEmail({ email, name }).catch((e) => console.error("[Staff] Welcome email failed:", e.message));
    }
    return { staff, hasAccount: !!userData };
  } catch (e) {
    if (e.code === 11000 && e.keyPattern?.email) throw dupEmailErr();
    throw e;
  }
};

exports.getBySubject = async (subjectId) =>
  Staff.find({ subjects: subjectId }).populate("subjects").populate("classes");

exports.getByClass = async (classId) =>
  Staff.find({ classes: classId }).populate("subjects").populate("classes");
