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

async function deleteMetadata(req, res, next) {
  try { await service.remove(req.params.id); res.json({ message: "Metadata deleted successfully" }); }
  catch (err) { next(err); }
}

module.exports = { createMetadata, getAllMetadata, getMetadataById, updateMetadata, deleteMetadata };
