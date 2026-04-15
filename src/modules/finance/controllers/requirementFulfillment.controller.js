const RequirementFulfillment = require("../models/requirementFulfillment.model");
const RequirementSet = require("../models/requirementSet.model");
const { Student } = require("../../people");

async function createRequirementFulfillment(req, res, next) {
  try {
    const { studentId, requirementSetId, fulfillmentDate, fulfilledItems, receiptNumber, notes } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    const requirementSet = await RequirementSet.findById(requirementSetId).populate("requirementItems.requirement");
    if (!requirementSet) return res.status(404).json({ message: "Requirement set not found" });
    const existing = await RequirementFulfillment.findOne({ student: studentId, requirementSet: requirementSetId });
    if (existing) return res.status(409).json({ message: "A fulfillment record already exists for this student and requirement set", data: existing });
    let fulfillment;
    if (fulfilledItems) {
      const processedItems = fulfilledItems.map((item) => {
        const reqItem = requirementSet.requirementItems.find((ri) => ri.requirement._id.toString() === item.requirement.toString());
        const requiredQuantity = reqItem ? reqItem.quantity : item.requiredQuantity;
        return { ...item, requiredQuantity, balance: requiredQuantity - item.fulfilledQuantity };
      });
      fulfillment = new RequirementFulfillment({ student: studentId, requirementSet: requirementSetId, SchoolClass: requirementSet.SchoolClass, AcademicTerm: requirementSet.AcademicTerm, fulfillmentDate: fulfillmentDate || new Date(), fulfilledItems: processedItems, receiptNumber, notes, recordedBy: req.user._id });
    } else {
      fulfillment = await RequirementFulfillment.createFromRequirementSet(studentId, requirementSetId, req.user._id, fulfillmentDate);
      fulfillment.receiptNumber = receiptNumber;
      fulfillment.notes = notes;
    }
    await fulfillment.save();
    res.status(201).json({ message: "Requirement fulfillment created successfully", data: fulfillment });
  } catch (err) { next(err); }
}

async function getAllRequirementFulfillments(req, res, next) {
  try {
    const fulfillments = await RequirementFulfillment.find()
      .populate("student", "firstName lastName otherName").populate("requirementSet", "name")
      .populate("SchoolClass", "name").populate("AcademicTerm", "name")
      .populate("fulfilledItems.requirement").populate("recordedBy", "fullName");
    res.json(fulfillments);
  } catch (err) { next(err); }
}

async function getRequirementFulfillmentById(req, res, next) {
  try {
    const f = await RequirementFulfillment.findById(req.params.id)
      .populate("student", "firstName lastName otherName").populate("requirementSet")
      .populate("SchoolClass", "name").populate("AcademicTerm", "name")
      .populate("fulfilledItems.requirement").populate("recordedBy", "fullName");
    if (!f) return res.status(404).json({ message: "Requirement fulfillment not found" });
    res.json(f);
  } catch (err) { next(err); }
}

async function updateRequirementFulfillment(req, res, next) {
  try {
    const { fulfilledItems, receiptNumber, notes, fulfillmentDate } = req.body;
    const fulfillment = await RequirementFulfillment.findById(req.params.id).populate("requirementSet");
    if (!fulfillment) return res.status(404).json({ message: "Requirement fulfillment not found" });
    if (fulfilledItems) {
      for (const updatedItem of fulfilledItems) {
        const existing = fulfillment.fulfilledItems.find((i) => i.requirement.toString() === updatedItem.requirement.toString());
        if (existing) { existing.fulfilledQuantity = updatedItem.fulfilledQuantity; if (updatedItem.notes) existing.notes = updatedItem.notes; }
        else {
          const inSet = fulfillment.requirementSet.requirementItems.some((i) => i.requirement.toString() === updatedItem.requirement.toString());
          if (!inSet) return res.status(400).json({ message: `Requirement ${updatedItem.requirement} is not part of this requirement set` });
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
    res.json({ message: "Requirement fulfillment updated successfully", data: fulfillment });
  } catch (err) { next(err); }
}

async function deleteRequirementFulfillment(req, res, next) {
  try {
    const f = await RequirementFulfillment.findByIdAndDelete(req.params.id);
    if (!f) return res.status(404).json({ message: "Requirement fulfillment not found" });
    res.json({ message: "Requirement fulfillment deleted successfully" });
  } catch (err) { next(err); }
}

async function getStudentFulfillments(req, res, next) {
  try {
    const fulfillments = await RequirementFulfillment.find({ student: req.params.studentId })
      .populate("requirementSet", "name description").populate("SchoolClass", "name").populate("AcademicTerm", "name")
      .populate("fulfilledItems.requirement").sort({ fulfillmentDate: -1 });
    res.json(fulfillments);
  } catch (err) { next(err); }
}

async function getRequirementSetFulfillments(req, res, next) {
  try {
    const fulfillments = await RequirementFulfillment.find({ requirementSet: req.params.requirementSetId })
      .populate("student", "firstName lastName otherName").populate("fulfilledItems.requirement").sort({ fulfillmentDate: -1 });
    res.json(fulfillments);
  } catch (err) { next(err); }
}

async function getStudentRequirementSetFulfillment(req, res, next) {
  try {
    const f = await RequirementFulfillment.findOne({ student: req.params.studentId, requirementSet: req.params.requirementSetId })
      .populate("student", "firstName lastName otherName").populate("requirementSet")
      .populate("SchoolClass", "name").populate("AcademicTerm", "name")
      .populate("fulfilledItems.requirement").populate("recordedBy", "fullName");
    if (!f) return res.status(404).json({ message: "No fulfillment found for this student and requirement set" });
    res.json(f);
  } catch (err) { next(err); }
}

async function updateFulfillmentItems(req, res, next) {
  try {
    const { fulfillmentId } = req.params;
    const { fulfilledItems, notes } = req.body;
    const fulfillment = await RequirementFulfillment.findById(fulfillmentId);
    if (!fulfillment) return res.status(404).json({ message: "Requirement fulfillment not found" });
    if (fulfilledItems && fulfilledItems.length > 0) {
      for (const updatedItem of fulfilledItems) {
        const existing = fulfillment.fulfilledItems.find((i) => i.requirement.toString() === updatedItem.requirement.toString());
        if (existing) { existing.fulfilledQuantity = updatedItem.fulfilledQuantity; if (updatedItem.notes) existing.notes = updatedItem.notes; }
      }
    }
    if (notes) fulfillment.notes = notes;
    await fulfillment.save();
    res.json({ message: "Fulfillment items updated successfully", data: fulfillment });
  } catch (err) { next(err); }
}

module.exports = {
  createRequirementFulfillment, getAllRequirementFulfillments, getRequirementFulfillmentById,
  updateRequirementFulfillment, deleteRequirementFulfillment,
  getStudentFulfillments, getRequirementSetFulfillments, getStudentRequirementSetFulfillment,
  updateFulfillmentItems,
};
