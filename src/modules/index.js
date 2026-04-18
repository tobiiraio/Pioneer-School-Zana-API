const express = require("express");
const router = express.Router();

// Routers required directly (not via module index) to avoid circular deps.
// Module index files export models only — for cross-module imports.
router.use("/", require("./auth/routes/auth.routes"));
router.use("/", require("./academics/routes/academics.routes"));
router.use("/", require("./people/routes/people.routes"));
router.use("/", require("./assessments/routes/assessments.routes"));
router.use("/", require("./finance/routes/finance.routes"));
router.use("/", require("./system/routes/system.routes"));
router.use("/", require("./grades/routes/grades.routes"));

// Public verification routes — no auth, rate-limited, read-only
router.use("/", require("./people/routes/public.routes"));
router.use("/", require("./finance/routes/public.routes"));
router.use("/", require("./assessments/routes/public.routes"));
router.use("/", require("./academics/routes/public.routes"));
router.use("/", require("./grades/routes/public.routes"));

router.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = router;
