const express = require("express");
const router = express.Router();

router.use("/", require("./auth/auth.routes"));
router.use("/", require("./academics/academics.routes"));
router.use("/", require("./people/people.routes"));
router.use("/", require("./assessments/assessments.routes"));
router.use("/", require("./finance/finance.routes"));
router.use("/", require("./system/system.routes"));

router.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = router;
