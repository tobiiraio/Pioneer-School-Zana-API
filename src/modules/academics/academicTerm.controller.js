const AcademicTerm = require("../../models/academicTerm.model");

async function createAcademicTerm(req, res, next) {
  try {
    const academicTerm = new AcademicTerm(req.body);
    await academicTerm.save();
    res.status(201).json({ message: "Academic term created successfully", data: academicTerm });
  } catch (err) { next(err); }
}

async function getAllAcademicTerms(req, res, next) {
  try {
    res.json(await AcademicTerm.find().populate("academic_year_id"));
  } catch (err) { next(err); }
}

async function getAcademicTermById(req, res, next) {
  try {
    const academicTerm = await AcademicTerm.findById(req.params.id).populate("academic_year_id");
    if (!academicTerm) return res.status(404).json({ message: "Academic term not found" });
    res.json(academicTerm);
  } catch (err) { next(err); }
}

async function updateAcademicTerm(req, res, next) {
  try {
    const academicTerm = await AcademicTerm.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!academicTerm) return res.status(404).json({ message: "Academic term not found" });
    res.json({ message: "Academic term updated successfully", data: academicTerm });
  } catch (err) { next(err); }
}

async function deleteAcademicTerm(req, res, next) {
  try {
    const academicTerm = await AcademicTerm.findByIdAndDelete(req.params.id);
    if (!academicTerm) return res.status(404).json({ message: "Academic term not found" });
    res.json({ message: "Academic term deleted successfully" });
  } catch (err) { next(err); }
}

module.exports = { createAcademicTerm, getAllAcademicTerms, getAcademicTermById, updateAcademicTerm, deleteAcademicTerm };
