const Requirement = require("../models/requirement.model");

async function createRequirement(req, res, next) {
  try {
    const requirement = new Requirement(req.body);
    await requirement.save();
    res.status(201).json({ message: "Requirement created successfully", data: requirement });
  } catch (err) { next(err); }
}

async function getAllRequirements(req, res, next) {
  try {
    res.json(await Requirement.find());
  } catch (err) { next(err); }
}

async function getRequirementById(req, res, next) {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) return res.status(404).json({ message: "Requirement not found" });
    res.json(requirement);
  } catch (err) { next(err); }
}

async function updateRequirement(req, res, next) {
  try {
    const requirement = await Requirement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!requirement) return res.status(404).json({ message: "Requirement not found" });
    res.json({ message: "Requirement updated successfully", data: requirement });
  } catch (err) { next(err); }
}

async function deleteRequirement(req, res, next) {
  try {
    const requirement = await Requirement.findByIdAndDelete(req.params.id);
    if (!requirement) return res.status(404).json({ message: "Requirement not found" });
    res.json({ message: "Requirement deleted successfully" });
  } catch (err) { next(err); }
}

module.exports = { createRequirement, getAllRequirements, getRequirementById, updateRequirement, deleteRequirement };
