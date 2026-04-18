const service = require("../services/metadata.service");

async function createMetadata(req, res, next) {
  try { res.status(201).json({ message: "Metadata created successfully", data: await service.create(req.body) }); }
  catch (err) { next(err); }
}

async function getAllMetadata(req, res, next) {
  try { res.json(await service.getAll()); }
  catch (err) { next(err); }
}

async function getMetadataById(req, res, next) {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
}

async function updateMetadata(req, res, next) {
  try { res.json({ message: "Metadata updated successfully", data: await service.update(req.params.id, req.body) }); }
  catch (err) { next(err); }
}

async function getActiveMetadata(req, res, next) {
  try { res.json(await service.getActive()); }
  catch (err) { next(err); }
}

async function uploadMetadataLogo(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ message: "Logo uploaded successfully", data: await service.uploadLogo(req.params.id, req.file) });
  }
  catch (err) { next(err); }
}

async function setActiveMetadata(req, res, next) {
  try { res.json({ message: "Metadata activated", data: await service.setActive(req.params.id) }); }
  catch (err) { next(err); }
}

async function deleteMetadata(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Metadata deleted successfully" }); }
  catch (err) { next(err); }
}

module.exports = { createMetadata, getAllMetadata, getActiveMetadata, getMetadataById, updateMetadata, setActiveMetadata, uploadMetadataLogo, deleteMetadata };
