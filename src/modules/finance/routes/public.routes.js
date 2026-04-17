const express = require("express");
const router = express.Router();
const rateLimiter = require("../../../shared/middlewares/rateLimit.middleware");
const service = require("../services/verify.service");

async function handle(res, next, fn) {
  try { res.json({ message: "Record found", data: await fn() }); }
  catch (err) { next(err); }
}

router.get("/school-fees/:id/public", rateLimiter, (req, res, next) =>
  handle(res, next, () => service.getPublicSchoolFees(req.params.id))
);

router.get("/fulfillments/:id/public", rateLimiter, (req, res, next) =>
  handle(res, next, () => service.getPublicFulfillment(req.params.id))
);

module.exports = router;
