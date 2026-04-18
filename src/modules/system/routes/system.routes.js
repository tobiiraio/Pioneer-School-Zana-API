const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../../../shared/middlewares/auth.middleware");
const { upload } = require("../../../shared/upload");
const { createMetadata, getAllMetadata, getActiveMetadata, getMetadataById, updateMetadata, setActiveMetadata, uploadMetadataLogo, deleteMetadata } = require("../controllers/metadata.controller");

router.post("/metadata", authenticate, authorizeRole(["admin"]), createMetadata);
router.get("/metadata", authenticate, getAllMetadata);
router.get("/metadata/active", getActiveMetadata);
router.get("/metadata/:id", authenticate, getMetadataById);
router.put("/metadata/:id", authenticate, authorizeRole(["admin"]), updateMetadata);
router.patch("/metadata/:id/activate", authenticate, authorizeRole(["admin"]), setActiveMetadata);
router.patch("/metadata/:id/logo", authenticate, authorizeRole(["admin"]), upload.single("logo"), uploadMetadataLogo);
router.delete("/metadata/:id", authenticate, authorizeRole(["admin"]), deleteMetadata);

module.exports = router;
