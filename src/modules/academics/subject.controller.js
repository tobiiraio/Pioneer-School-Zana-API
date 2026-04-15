const Subject = require("./models/subject.model");

async function createSubject(req, res, next) {
  try {
    const { name, description } = req.body;
    const subject = new Subject({ name, description });
    await subject.save();
    res.status(201).json({ message: "Subject created successfully", data: subject });
  } catch (err) { next(err); }
}

async function getAllSubjects(req, res, next) {
  try {
    res.json(await Subject.find());
  } catch (err) { next(err); }
}

async function getSubjectById(req, res, next) {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json(subject);
  } catch (err) { next(err); }
}

async function updateSubject(req, res, next) {
  try {
    const { name, description } = req.body;
    const subject = await Subject.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject updated successfully", data: subject });
  } catch (err) { next(err); }
}

async function deleteSubject(req, res, next) {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject deleted successfully" });
  } catch (err) { next(err); }
}

module.exports = { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject };
