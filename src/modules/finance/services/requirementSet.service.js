const RequirementSet = require("../models/requirementSet.model");
const Requirement = require("../models/requirement.model");
const { SchoolClass, AcademicTerm } = require("../../academics");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.create = async ({ name, description, requirementItems, SchoolClass: SchoolClassId, AcademicTerm: AcademicTermId }) => {
  if (!await SchoolClass.findById(SchoolClassId)) throw err("SchoolClass not found", 400);
  if (!await AcademicTerm.findById(AcademicTermId)) throw err("AcademicTerm not found", 400);
  const requirementIds = requirementItems.map((i) => i.requirement);
  const valid = await Requirement.find({ _id: { $in: requirementIds } });
  if (valid.length !== requirementIds.length) throw err("Some requirements are invalid", 400);
  const set = new RequirementSet({ name, description, requirementItems, SchoolClass: SchoolClassId, AcademicTerm: AcademicTermId });
  await set.save();
  return set;
};

exports.getAll = async () =>
  RequirementSet.find()
    .populate("SchoolClass").populate("AcademicTerm")
    .populate({ path: "requirementItems.requirement", select: "name description unit" });

exports.getById = async (id) => {
  const set = await RequirementSet.findById(id)
    .populate("SchoolClass").populate("AcademicTerm")
    .populate({ path: "requirementItems.requirement", select: "name description unit" });
  if (!set) throw err("Requirement Set not found", 404);
  return set;
};

exports.update = async (id, { name, description, requirementItems, SchoolClass: SchoolClassId, AcademicTerm: AcademicTermId }) => {
  if (SchoolClassId && !await SchoolClass.findById(SchoolClassId)) throw err("SchoolClass not found", 400);
  if (AcademicTermId && !await AcademicTerm.findById(AcademicTermId)) throw err("AcademicTerm not found", 400);
  if (requirementItems) {
    const ids = requirementItems.map((i) => i.requirement);
    const valid = await Requirement.find({ _id: { $in: ids } });
    if (valid.length !== ids.length) throw err("Some requirements are invalid", 400);
  }
  const update = {};
  if (name) update.name = name;
  if (description) update.description = description;
  if (requirementItems) update.requirementItems = requirementItems;
  if (SchoolClassId) update.SchoolClass = SchoolClassId;
  if (AcademicTermId) update.AcademicTerm = AcademicTermId;
  update.updated_at = Date.now();
  const set = await RequirementSet.findByIdAndUpdate(id, update, { new: true });
  if (!set) throw err("Requirement Set not found", 404);
  return set;
};

exports.remove = async (id) => {
  const set = await RequirementSet.findByIdAndDelete(id);
  if (!set) throw err("Requirement Set not found", 404);
};
