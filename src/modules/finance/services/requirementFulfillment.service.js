const RequirementFulfillment = require("../models/requirementFulfillment.model");
const RequirementSet = require("../models/requirementSet.model");
const { Student } = require("../../people");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async ({ studentId, requirementSetId, fulfillmentDate, fulfilledItems, receiptNumber, notes }, userId) => {
  const student = await Student.findById(studentId);
  if (!student) throw err("Student not found", 404);
  const requirementSet = await RequirementSet.findById(requirementSetId).populate("requirementItems.requirement");
  if (!requirementSet) throw err("Requirement set not found", 404);
  const existing = await RequirementFulfillment.findOne({ student: studentId, requirementSet: requirementSetId });
  if (existing) {
    const conflict = err("A fulfillment record already exists for this student and requirement set", 409);
    conflict.data = existing;
    throw conflict;
  }
  let fulfillment;
  if (fulfilledItems) {
    const processedItems = fulfilledItems.map((item) => {
      const reqItem = requirementSet.requirementItems.find((ri) => ri.requirement._id.toString() === item.requirement.toString());
      const requiredQuantity = reqItem ? reqItem.quantity : item.requiredQuantity;
      return { ...item, requiredQuantity, balance: requiredQuantity - item.fulfilledQuantity };
    });
    fulfillment = new RequirementFulfillment({
      student: studentId, requirementSet: requirementSetId,
      SchoolClass: requirementSet.SchoolClass, AcademicTerm: requirementSet.AcademicTerm,
      fulfillmentDate: fulfillmentDate || new Date(), fulfilledItems: processedItems,
      receiptNumber, notes, recordedBy: userId,
    });
  } else {
    fulfillment = await RequirementFulfillment.createFromRequirementSet(studentId, requirementSetId, userId, fulfillmentDate);
    fulfillment.receiptNumber = receiptNumber;
    fulfillment.notes = notes;
  }
  await fulfillment.save();
  return fulfillment;
};

exports.getAll = async () =>
  RequirementFulfillment.find()
    .populate("student", "firstName lastName otherName").populate("requirementSet", "name")
    .populate("SchoolClass", "name").populate("AcademicTerm", "name")
    .populate("fulfilledItems.requirement").populate("recordedBy", "fullName");

exports.getById = async (id) => {
  const f = await RequirementFulfillment.findById(id)
    .populate("student", "firstName lastName otherName").populate("requirementSet")
    .populate("SchoolClass", "name").populate("AcademicTerm", "name")
    .populate("fulfilledItems.requirement").populate("recordedBy", "fullName");
  if (!f) throw err("Requirement fulfillment not found", 404);
  return f;
};

exports.update = async (id, { fulfilledItems, receiptNumber, notes, fulfillmentDate }) => {
  const fulfillment = await RequirementFulfillment.findById(id).populate("requirementSet");
  if (!fulfillment) throw err("Requirement fulfillment not found", 404);
  if (fulfilledItems) {
    for (const updatedItem of fulfilledItems) {
      const existing = fulfillment.fulfilledItems.find((i) => i.requirement.toString() === updatedItem.requirement.toString());
      if (existing) {
        existing.fulfilledQuantity = updatedItem.fulfilledQuantity;
        if (updatedItem.notes) existing.notes = updatedItem.notes;
      } else {
        const inSet = fulfillment.requirementSet.requirementItems.some((i) => i.requirement.toString() === updatedItem.requirement.toString());
        if (!inSet) throw err(`Requirement ${updatedItem.requirement} is not part of this requirement set`, 400);
        const reqItem = fulfillment.requirementSet.requirementItems.find((i) => i.requirement.toString() === updatedItem.requirement.toString());
        const requiredQuantity = reqItem ? reqItem.quantity : 0;
        fulfillment.fulfilledItems.push({ requirement: updatedItem.requirement, requiredQuantity, fulfilledQuantity: updatedItem.fulfilledQuantity, balance: requiredQuantity - updatedItem.fulfilledQuantity, notes: updatedItem.notes || "" });
      }
    }
  }
  if (receiptNumber) fulfillment.receiptNumber = receiptNumber;
  if (notes) fulfillment.notes = notes;
  if (fulfillmentDate) fulfillment.fulfillmentDate = fulfillmentDate;
  await fulfillment.save();
  return fulfillment;
};

exports.remove = async (id) => {
  const f = await RequirementFulfillment.findByIdAndDelete(id);
  if (!f) throw err("Requirement fulfillment not found", 404);
};

exports.getByStudent = async (studentId) =>
  RequirementFulfillment.find({ student: studentId })
    .populate("requirementSet", "name description").populate("SchoolClass", "name").populate("AcademicTerm", "name")
    .populate("fulfilledItems.requirement").sort({ fulfillmentDate: -1 });

exports.getByRequirementSet = async (requirementSetId) =>
  RequirementFulfillment.find({ requirementSet: requirementSetId })
    .populate("student", "firstName lastName otherName").populate("fulfilledItems.requirement").sort({ fulfillmentDate: -1 });

exports.getByStudentAndSet = async (studentId, requirementSetId) => {
  const f = await RequirementFulfillment.findOne({ student: studentId, requirementSet: requirementSetId })
    .populate("student", "firstName lastName otherName").populate("requirementSet")
    .populate("SchoolClass", "name").populate("AcademicTerm", "name")
    .populate("fulfilledItems.requirement").populate("recordedBy", "fullName");
  if (!f) throw err("No fulfillment found for this student and requirement set", 404);
  return f;
};

exports.updateItems = async (fulfillmentId, { fulfilledItems, notes }) => {
  const fulfillment = await RequirementFulfillment.findById(fulfillmentId);
  if (!fulfillment) throw err("Requirement fulfillment not found", 404);
  if (fulfilledItems && fulfilledItems.length > 0) {
    for (const updatedItem of fulfilledItems) {
      const existing = fulfillment.fulfilledItems.find((i) => i.requirement.toString() === updatedItem.requirement.toString());
      if (existing) {
        existing.fulfilledQuantity = updatedItem.fulfilledQuantity;
        if (updatedItem.notes) existing.notes = updatedItem.notes;
      }
    }
  }
  if (notes) fulfillment.notes = notes;
  await fulfillment.save();
  return fulfillment;
};
