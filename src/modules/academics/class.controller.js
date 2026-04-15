const SchoolClass = require("../../models/class.model");

async function createClass(req, res, next) {
  try {
    const schoolClass = new SchoolClass(req.body);
    await schoolClass.save();
    res.status(201).json({ message: "Class created successfully", data: schoolClass });
  } catch (err) { next(err); }
}

async function getAllClasses(req, res, next) {
  try {
    res.json(await SchoolClass.find());
  } catch (err) { next(err); }
}

async function getClassById(req, res, next) {
  try {
    const schoolClass = await SchoolClass.findById(req.params.id);
    if (!schoolClass) return res.status(404).json({ message: "Class not found" });
    res.json(schoolClass);
  } catch (err) { next(err); }
}

async function updateClass(req, res, next) {
  try {
    const schoolClass = await SchoolClass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schoolClass) return res.status(404).json({ message: "Class not found" });
    res.json({ message: "Class updated successfully", data: schoolClass });
  } catch (err) { next(err); }
}

async function deleteClass(req, res, next) {
  try {
    const schoolClass = await SchoolClass.findByIdAndDelete(req.params.id);
    if (!schoolClass) return res.status(404).json({ message: "Class not found" });
    res.json({ message: "Class deleted successfully" });
  } catch (err) { next(err); }
}

module.exports = { createClass, getAllClasses, getClassById, updateClass, deleteClass };
