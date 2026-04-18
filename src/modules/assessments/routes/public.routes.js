const express = require("express");
const router = express.Router();
const rateLimiter = require("../../../shared/middlewares/rateLimit.middleware");
const service = require("../services/verify.service");

router.get("/reports/verify/:studentId/:termId", rateLimiter, async (req, res, next) => {
  try {
    const data = await service.getPublicReport(req.params.studentId, req.params.termId);
    res.json({ message: "Record found", data });
  }
  catch (err) { next(err); }
});

module.exports = router;
