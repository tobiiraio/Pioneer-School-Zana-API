const express = require("express");
const router = express.Router();
const rateLimiter = require("../../../shared/middlewares/rateLimit.middleware");
const service = require("../services/grade.service");

router.get("/grades/public", rateLimiter, async (req, res, next) => {
  try { res.json({ message: "Grades fetched successfully", data: await service.getAll() }); }
  catch (err) { next(err); }
});

module.exports = router;
