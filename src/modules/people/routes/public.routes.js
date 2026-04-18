const express = require("express");
const router = express.Router();
const rateLimiter = require("../../../shared/middlewares/rateLimit.middleware");
const service = require("../services/verify.service");

async function handle(res, next, fn) {
  try { res.json({ message: "Record found", data: await fn() }); }
  catch (err) { next(err); }
}

router.get("/students/:id/public", rateLimiter, (req, res, next) =>
  handle(res, next, () => service.getPublicStudent(req.params.id))
);

router.get("/staff/:id/public", rateLimiter, (req, res, next) =>
  handle(res, next, () => service.getPublicStaff(req.params.id))
);

router.get("/parents/:id/public", rateLimiter, (req, res, next) =>
  handle(res, next, () => service.getPublicParent(req.params.id))
);

module.exports = router;
