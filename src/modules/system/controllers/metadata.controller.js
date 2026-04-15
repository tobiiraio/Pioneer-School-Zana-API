const Metadata = require("../models/metadata.model");

async function createMetadata(req, res, next) {
  try {
    const metadata = new Metadata(req.body);
    await metadata.save();
    res.status(201).json({ message: "Metadata created successfully", data: metadata });
  } catch (err) { next(err); }
}

async function getAllMetadata(req, res, next) {
  try {
    res.json(await Metadata.find());
  } catch (err) { next(err); }
}

async function getMetadataById(req, res, next) {
  try {
    const metadata = await Metadata.findById(req.params.id);
    if (!metadata) return res.status(404).json({ message: "Metadata not found" });
    res.json(metadata);
  } catch (err) { next(err); }
}

async function updateMetadata(req, res, next) {
  try {
    const metadata = await Metadata.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!metadata) return res.status(404).json({ message: "Metadata not found" });
    res.json({ message: "Metadata updated successfully", data: metadata });
  } catch (err) { next(err); }
}

async function deleteMetadata(req, res, next) {
  try {
    const metadata = await Metadata.findByIdAndDelete(req.params.id);
    if (!metadata) return res.status(404).json({ message: "Metadata not found" });
    res.json({ message: "Metadata deleted successfully" });
  } catch (err) { next(err); }
}

module.exports = { createMetadata, getAllMetadata, getMetadataById, updateMetadata, deleteMetadata };
