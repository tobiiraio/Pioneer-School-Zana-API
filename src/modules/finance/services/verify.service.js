const SchoolFees = require("../models/schoolfees.model");
const RequirementFulfillment = require("../models/requirementFulfillment.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.getPublicSchoolFees = async (id) => {
  const record = await SchoolFees.findById(id)
    .select("student amount bal date rn academicTerm studentClass")
    .populate("student", "firstName lastName otherName")
    .populate("academicTerm", "name")
    .populate("studentClass", "name");
  if (!record) throw err("Record not found", 404);
  return {
    studentId: record.student._id,
    studentName: record.student.fullName || `${record.student.firstName} ${record.student.lastName}`,
    amount: record.amount,
    balance: record.bal,
    date: record.date,
    receiptNumber: record.rn,
    term: record.academicTerm?.name || null,
    class: record.studentClass?.name || null,
  };
};

exports.getPublicFulfillment = async (id) => {
  const record = await RequirementFulfillment.findById(id)
    .select("student requirementSet fulfillmentDate status receiptNumber")
    .populate("student", "firstName lastName otherName")
    .populate("requirementSet", "name");
  if (!record) throw err("Record not found", 404);
  return {
    studentId: record.student._id,
    studentName: `${record.student.firstName} ${record.student.lastName}`,
    requirementName: record.requirementSet?.name || null,
    status: record.status,
    receiptNumber: record.receiptNumber || null,
    date: record.fulfillmentDate,
  };
};
