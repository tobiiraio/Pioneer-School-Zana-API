const RequirementSet = require("./models/requirementSet.model");
const Requirement = require("./models/requirement.model");
const { SchoolClass, AcademicTerm } = require("../academics");

async function createRequirementSet(req, res, next) {
  try {
    const { name, description, requirementItems, SchoolClass: SchoolClassId, AcademicTerm: AcademicTermId } = req.body;
    if (!await SchoolClass.findById(SchoolClassId)) return res.status(400).json({ message: "SchoolClass not found" });
    if (!await AcademicTerm.findById(AcademicTermId)) return res.status(400).json({ message: "AcademicTerm not found" });
    const requirementIds = requirementItems.map((i) => i.requirement);
    const valid = await Requirement.find({ _id: { $in: requirementIds } });
    if (valid.length !== requirementIds.length) return res.status(400).json({ message: "Some requirements are invalid" });
    const requirementSet = new RequirementSet({ name, description, requirementItems, SchoolClass: SchoolClassId, AcademicTerm: AcademicTermId });
    await requirementSet.save();
    res.status(201).json({ message: "Requirement Set created successfully", data: requirementSet });
  } catch (err) { next(err); }
}

async function getAllRequirementSets(req, res, next) {
  try {
    const sets = await RequirementSet.find().populate("SchoolClass").populate("AcademicTerm").populate({ path: "requirementItems.requirement", select: "name description unit" });
    res.json(sets);
  } catch (err) { next(err); }
}

async function getRequirementSetById(req, res, next) {
  try {
    const set = await RequirementSet.findById(req.params.id).populate("SchoolClass").populate("AcademicTerm").populate({ path: "requirementItems.requirement", select: "name description unit" });
    if (!set) return res.status(404).json({ message: "Requirement Set not found" });
    res.json(set);
  } catch (err) { next(err); }
}

async function updateRequirementSet(req, res, next) {
  try {
    const { name, description, requirementItems, SchoolClass: SchoolClassId, AcademicTerm: AcademicTermId } = req.body;
    if (SchoolClassId && !await SchoolClass.findById(SchoolClassId)) return res.status(400).json({ message: "SchoolClass not found" });
    if (AcademicTermId && !await AcademicTerm.findById(AcademicTermId)) return res.status(400).json({ message: "AcademicTerm not found" });
    if (requirementItems) {
      const ids = requirementItems.map((i) => i.requirement);
      const valid = await Requirement.find({ _id: { $in: ids } });
      if (valid.length !== ids.length) return res.status(400).json({ message: "Some requirements are invalid" });
    }
    const update = {};
    if (name) update.name = name;
    if (description) update.description = description;
    if (requirementItems) update.requirementItems = requirementItems;
    if (SchoolClassId) update.SchoolClass = SchoolClassId;
    if (AcademicTermId) update.AcademicTerm = AcademicTermId;
    update.updated_at = Date.now();
    const set = await RequirementSet.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!set) return res.status(404).json({ message: "Requirement Set not found" });
    res.json({ message: "Requirement Set updated successfully", data: set });
  } catch (err) { next(err); }
}

async function deleteRequirementSet(req, res, next) {
  try {
    const set = await RequirementSet.findByIdAndDelete(req.params.id);
    if (!set) return res.status(404).json({ message: "Requirement Set not found" });
    res.json({ message: "Requirement Set deleted successfully" });
  } catch (err) { next(err); }
}

module.exports = { createRequirementSet, getAllRequirementSets, getRequirementSetById, updateRequirementSet, deleteRequirementSet };
