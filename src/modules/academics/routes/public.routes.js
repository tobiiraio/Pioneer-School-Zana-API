const express = require("express");
const router = express.Router();
const rateLimiter = require("../../../shared/middlewares/rateLimit.middleware");
const service = require("../services/verify.service");

router.get("/classes/:id/students/public", rateLimiter, async (req, res, next) => {
  try {
    const data = await service.getPublicClassRoster(req.params.id);
    res.json({ message: "Record found", data });
  }
  catch (err) { next(err); }
});

module.exports = router;
