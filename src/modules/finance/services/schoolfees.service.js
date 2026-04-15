const SchoolFees = require("../models/schoolfees.model");
const { Student } = require("../../people");
const { AcademicTerm, SchoolClass } = require("../../academics");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async (data) => {
  const student = await Student.findById(data.student);
  if (!student) throw err("Student not found", 404);
  const academicTerm = await AcademicTerm.findById(data.academicTerm);
  if (!academicTerm) throw err("Academic term not found", 404);
  const schoolClass = await SchoolClass.findById(data.studentClass);
  if (!schoolClass) throw err("School class not found", 404);
  const currentBalance = await SchoolFees.getCurrentBalance(data.student, data.academicTerm);
  const newBalance = currentBalance - data.amount;
  const schoolFees = new SchoolFees({ ...data, bf: currentBalance, bal: newBalance });
  await schoolFees.save();
  await schoolFees.populate([
    { path: "student", select: "firstName lastName otherName fullName" },
    { path: "academicTerm", select: "name year" },
    { path: "studentClass", select: "name level" },
  ]);
  return schoolFees;
};

exports.getAll = async ({ page = 1, limit = 50, termId, classId, studentId, startDate, endDate } = {}) => {
  const filter = {};
  if (termId) filter.academicTerm = termId;
  if (classId) filter.studentClass = classId;
  if (studentId) filter.student = studentId;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  const skip = (page - 1) * limit;
  const [schoolFees, total] = await Promise.all([
    SchoolFees.find(filter)
      .populate("student", "firstName lastName otherName fullName EMISNo")
      .populate("academicTerm", "name year").populate("studentClass", "name level")
      .sort({ date: -1 }).limit(limit * 1).skip(skip),
    SchoolFees.countDocuments(filter),
  ]);
  return { data: schoolFees, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) } };
};

exports.getById = async (id) => {
  const schoolFees = await SchoolFees.findById(id)
    .populate("student", "firstName lastName otherName fullName EMISNo LINNumber")
    .populate("academicTerm", "name year startDate endDate").populate("studentClass", "name level section");
  if (!schoolFees) throw err("School fees transaction not found", 404);
  return schoolFees;
};

exports.update = async (id, data) => {
  const schoolFees = await SchoolFees.findById(id);
  if (!schoolFees) throw err("School fees transaction not found", 404);
  if (data.amount && data.amount !== schoolFees.amount) {
    const difference = data.amount - schoolFees.amount;
    data.bal = schoolFees.bal - difference;
  }
  return SchoolFees.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate([
      { path: "student", select: "firstName lastName otherName fullName" },
      { path: "academicTerm", select: "name year" },
      { path: "studentClass", select: "name level" },
    ]);
};

exports.remove = async (id) => {
  const schoolFees = await SchoolFees.findByIdAndDelete(id);
  if (!schoolFees) throw err("School fees transaction not found", 404);
};

exports.getByStudent = async (studentId, termId) => {
  const student = await Student.findById(studentId);
  if (!student) throw err("Student not found", 404);
  const schoolFees = await SchoolFees.getStudentTransactions(studentId, termId);
  const summary = {
    totalPaid: schoolFees.reduce((s, f) => s + f.amount, 0),
    currentBalance: schoolFees.length > 0 ? schoolFees[schoolFees.length - 1].bal : 0,
    transactionCount: schoolFees.length,
  };
  return { student: { id: student._id, name: student.fullName, class: student.currentClass }, transactions: schoolFees, summary };
};

exports.getByClass = async (classId, termId) => {
  const filter = { studentClass: classId };
  if (termId) filter.academicTerm = termId;
  const schoolFees = await SchoolFees.find(filter)
    .populate("student", "firstName lastName otherName fullName").populate("academicTerm", "name year").sort({ date: -1 });
  const studentSummary = {};
  schoolFees.forEach((fee) => {
    const sid = fee.student._id.toString();
    if (!studentSummary[sid]) studentSummary[sid] = { student: fee.student, totalPaid: 0, currentBalance: fee.bal, transactionCount: 0 };
    studentSummary[sid].totalPaid += fee.amount;
    studentSummary[sid].transactionCount += 1;
  });
  return { transactions: schoolFees, summary: Object.values(studentSummary) };
};

exports.getByTerm = async (termId) => {
  const schoolFees = await SchoolFees.find({ academicTerm: termId })
    .populate("student", "firstName lastName otherName fullName").populate("studentClass", "name level").sort({ date: -1 });
  const summary = {
    totalCollected: schoolFees.reduce((s, f) => s + f.amount, 0),
    transactionCount: schoolFees.length,
    uniqueStudents: new Set(schoolFees.map((f) => f.student._id.toString())).size,
  };
  return { transactions: schoolFees, summary };
};

exports.getStudentBalance = async (studentId, termId) => {
  if (!termId) throw err("Academic term ID is required", 400);
  const [balance, student] = await Promise.all([
    SchoolFees.getCurrentBalance(studentId, termId),
    Student.findById(studentId).select("firstName lastName otherName fullName"),
  ]);
  return { student, academicTerm: termId, currentBalance: balance };
};

exports.generateReport = async ({ startDate, endDate, termId, classId } = {}) => {
  const filter = {};
  if (termId) filter.academicTerm = termId;
  if (classId) filter.studentClass = classId;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  const schoolFees = await SchoolFees.find(filter)
    .populate("student", "firstName lastName otherName fullName")
    .populate("academicTerm", "name year").populate("studentClass", "name level").sort({ date: 1 });
  return {
    period: { startDate: startDate || "All time", endDate: endDate || "Current" },
    summary: { totalTransactions: schoolFees.length, totalAmount: schoolFees.reduce((s, f) => s + f.amount, 0), uniqueStudents: new Set(schoolFees.map((f) => f.student._id.toString())).size },
    transactions: schoolFees,
  };
};

exports.getAdminView = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [schoolFees, total] = await Promise.all([
    SchoolFees.find().populate("student", "firstName lastName otherName fullName").sort({ date: -1 }).limit(limit * 1).skip(skip),
    SchoolFees.countDocuments(),
  ]);
  const data = schoolFees.map((fee) => ({ transactionId: fee._id, studentName: fee.student.fullName, date: fee.date, bf: fee.bf, rn: fee.rn || "N/A", amount: fee.amount, balance: fee.bal }));
  return { data, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) } };
};
