const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../../middlewares/auth.middleware");
const { createMetadata, getAllMetadata, getMetadataById, updateMetadata, deleteMetadata } = require("./metadata.controller");

router.post("/metadata", authenticate, authorizeRole(["admin"]), createMetadata);
router.get("/metadata", authenticate, getAllMetadata);
router.get("/metadata/:id", authenticate, getMetadataById);
router.put("/metadata/:id", authenticate, authorizeRole(["admin"]), updateMetadata);
router.delete("/metadata/:id", authenticate, authorizeRole(["admin"]), deleteMetadata);

module.exports = router;
