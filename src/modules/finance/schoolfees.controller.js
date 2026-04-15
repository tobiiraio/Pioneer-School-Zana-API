const SchoolFees = require("../../models/schoolfees.model");
const Student = require("../../models/student.model");
const AcademicTerm = require("../../models/academicTerm.model");
const SchoolClass = require("../../models/class.model");

async function createSchoolFees(req, res, next) {
  try {
    const student = await Student.findById(req.body.student);
    if (!student) return res.status(404).json({ message: "Student not found" });
    const academicTerm = await AcademicTerm.findById(req.body.academicTerm);
    if (!academicTerm) return res.status(404).json({ message: "Academic term not found" });
    const schoolClass = await SchoolClass.findById(req.body.studentClass);
    if (!schoolClass) return res.status(404).json({ message: "School class not found" });
    const currentBalance = await SchoolFees.getCurrentBalance(req.body.student, req.body.academicTerm);
    const newBalance = currentBalance - req.body.amount;
    const schoolFees = new SchoolFees({ ...req.body, bf: currentBalance, bal: newBalance });
    await schoolFees.save();
    await schoolFees.populate([
      { path: "student", select: "firstName lastName otherName fullName" },
      { path: "academicTerm", select: "name year" },
      { path: "studentClass", select: "name level" },
    ]);
    res.status(201).json({ message: "School fees transaction created successfully", data: schoolFees });
  } catch (err) { next(err); }
}

async function getAllSchoolFees(req, res, next) {
  try {
    const { page = 1, limit = 50, termId, classId, studentId, startDate, endDate } = req.query;
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
    const schoolFees = await SchoolFees.find(filter)
      .populate("student", "firstName lastName otherName fullName EMISNo")
      .populate("academicTerm", "name year").populate("studentClass", "name level")
      .sort({ date: -1 }).limit(limit * 1).skip(skip);
    const total = await SchoolFees.countDocuments(filter);
    res.json({ data: schoolFees, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) } });
  } catch (err) { next(err); }
}

async function getSchoolFeesById(req, res, next) {
  try {
    const schoolFees = await SchoolFees.findById(req.params.id)
      .populate("student", "firstName lastName otherName fullName EMISNo LINNumber")
      .populate("academicTerm", "name year startDate endDate").populate("studentClass", "name level section");
    if (!schoolFees) return res.status(404).json({ message: "School fees transaction not found" });
    res.json(schoolFees);
  } catch (err) { next(err); }
}

async function updateSchoolFees(req, res, next) {
  try {
    const schoolFees = await SchoolFees.findById(req.params.id);
    if (!schoolFees) return res.status(404).json({ message: "School fees transaction not found" });
    if (req.body.amount && req.body.amount !== schoolFees.amount) {
      const difference = req.body.amount - schoolFees.amount;
      req.body.bal = schoolFees.bal - difference;
    }
    const updated = await SchoolFees.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate([{ path: "student", select: "firstName lastName otherName fullName" }, { path: "academicTerm", select: "name year" }, { path: "studentClass", select: "name level" }]);
    res.json({ message: "School fees transaction updated successfully", data: updated });
  } catch (err) { next(err); }
}

async function deleteSchoolFees(req, res, next) {
  try {
    const schoolFees = await SchoolFees.findByIdAndDelete(req.params.id);
    if (!schoolFees) return res.status(404).json({ message: "School fees transaction not found" });
    res.json({ message: "School fees transaction deleted successfully" });
  } catch (err) { next(err); }
}

async function getSchoolFeesByStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    const { termId } = req.query;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    const schoolFees = await SchoolFees.getStudentTransactions(studentId, termId);
    const summary = { totalPaid: schoolFees.reduce((s, f) => s + f.amount, 0), currentBalance: schoolFees.length > 0 ? schoolFees[schoolFees.length - 1].bal : 0, transactionCount: schoolFees.length };
    res.json({ student: { id: student._id, name: student.fullName, class: student.currentClass }, transactions: schoolFees, summary });
  } catch (err) { next(err); }
}

async function getSchoolFeesByClass(req, res, next) {
  try {
    const { termId } = req.query;
    const filter = { studentClass: req.params.classId };
    if (termId) filter.academicTerm = termId;
    const schoolFees = await SchoolFees.find(filter).populate("student", "firstName lastName otherName fullName").populate("academicTerm", "name year").sort({ date: -1 });
    const studentSummary = {};
    schoolFees.forEach((fee) => {
      const sid = fee.student._id.toString();
      if (!studentSummary[sid]) studentSummary[sid] = { student: fee.student, totalPaid: 0, currentBalance: fee.bal, transactionCount: 0 };
      studentSummary[sid].totalPaid += fee.amount;
      studentSummary[sid].transactionCount += 1;
    });
    res.json({ transactions: schoolFees, summary: Object.values(studentSummary) });
  } catch (err) { next(err); }
}

async function getSchoolFeesByTerm(req, res, next) {
  try {
    const schoolFees = await SchoolFees.find({ academicTerm: req.params.termId }).populate("student", "firstName lastName otherName fullName").populate("studentClass", "name level").sort({ date: -1 });
    const summary = { totalCollected: schoolFees.reduce((s, f) => s + f.amount, 0), transactionCount: schoolFees.length, uniqueStudents: new Set(schoolFees.map((f) => f.student._id.toString())).size };
    res.json({ transactions: schoolFees, summary });
  } catch (err) { next(err); }
}

async function getStudentBalance(req, res, next) {
  try {
    const { studentId } = req.params;
    const { termId } = req.query;
    if (!termId) return res.status(400).json({ message: "Academic term ID is required" });
    const balance = await SchoolFees.getCurrentBalance(studentId, termId);
    const student = await Student.findById(studentId).select("firstName lastName otherName fullName");
    res.json({ student, academicTerm: termId, currentBalance: balance });
  } catch (err) { next(err); }
}

async function generateSchoolFeesReport(req, res, next) {
  try {
    const { startDate, endDate, termId, classId } = req.query;
    const filter = {};
    if (termId) filter.academicTerm = termId;
    if (classId) filter.studentClass = classId;
    if (startDate || endDate) { filter.date = {}; if (startDate) filter.date.$gte = new Date(startDate); if (endDate) filter.date.$lte = new Date(endDate); }
    const schoolFees = await SchoolFees.find(filter).populate("student", "firstName lastName otherName fullName").populate("academicTerm", "name year").populate("studentClass", "name level").sort({ date: 1 });
    res.json({ period: { startDate: startDate || "All time", endDate: endDate || "Current" }, summary: { totalTransactions: schoolFees.length, totalAmount: schoolFees.reduce((s, f) => s + f.amount, 0), uniqueStudents: new Set(schoolFees.map((f) => f.student._id.toString())).size }, transactions: schoolFees });
  } catch (err) { next(err); }
}

async function getAdminView(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const schoolFees = await SchoolFees.find().populate("student", "firstName lastName otherName fullName").sort({ date: -1 }).limit(limit * 1).skip(skip);
    const adminData = schoolFees.map((fee) => ({ transactionId: fee._id, studentName: fee.student.fullName, date: fee.date, bf: fee.bf, rn: fee.rn || "N/A", amount: fee.amount, balance: fee.bal }));
    const total = await SchoolFees.countDocuments();
    res.json({ data: adminData, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) } });
  } catch (err) { next(err); }
}

module.exports = { createSchoolFees, getAllSchoolFees, getSchoolFeesById, updateSchoolFees, deleteSchoolFees, getSchoolFeesByStudent, getSchoolFeesByClass, getSchoolFeesByTerm, getStudentBalance, generateSchoolFeesReport, getAdminView };
