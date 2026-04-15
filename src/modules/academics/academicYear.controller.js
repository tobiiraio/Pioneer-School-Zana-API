const AcademicYear = require("../../models/academicYear.model");

async function createAcademicYear(req, res, next) {
  try {
    const academicYear = new AcademicYear(req.body);
    await academicYear.save();
    res.status(201).json({ message: "Academic year created successfully", data: academicYear });
  } catch (err) { next(err); }
}

async function getAllAcademicYears(req, res, next) {
  try {
    res.json(await AcademicYear.find());
  } catch (err) { next(err); }
}

async function getAcademicYearById(req, res, next) {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);
    if (!academicYear) return res.status(404).json({ message: "Academic year not found" });
    res.json(academicYear);
  } catch (err) { next(err); }
}

async function updateAcademicYear(req, res, next) {
  try {
    const academicYear = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!academicYear) return res.status(404).json({ message: "Academic year not found" });
    res.json({ message: "Academic year updated successfully", data: academicYear });
  } catch (err) { next(err); }
}

async function deleteAcademicYear(req, res, next) {
  try {
    const academicYear = await AcademicYear.findByIdAndDelete(req.params.id);
    if (!academicYear) return res.status(404).json({ message: "Academic year not found" });
    res.json({ message: "Academic year deleted successfully" });
  } catch (err) { next(err); }
}

module.exports = { createAcademicYear, getAllAcademicYears, getAcademicYearById, updateAcademicYear, deleteAcademicYear };
