const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../../../shared/middlewares/auth.middleware");
const { createMetadata, getAllMetadata, getActiveMetadata, getMetadataById, updateMetadata, setActiveMetadata, deleteMetadata } = require("../controllers/metadata.controller");

router.post("/metadata", authenticate, authorizeRole(["admin"]), createMetadata);
router.get("/metadata", authenticate, getAllMetadata);
router.get("/metadata/active", getActiveMetadata);
router.get("/metadata/:id", authenticate, getMetadataById);
router.put("/metadata/:id", authenticate, authorizeRole(["admin"]), updateMetadata);
router.patch("/metadata/:id/activate", authenticate, authorizeRole(["admin"]), setActiveMetadata);
router.delete("/metadata/:id", authenticate, authorizeRole(["admin"]), deleteMetadata);

module.exports = router;
