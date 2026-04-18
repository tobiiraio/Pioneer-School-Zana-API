const service = require("../services/user.service");

exports.getUsers = async (req, res, next) => {
  try { res.json(await service.getAll(req.query)); }
  catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try { res.json(await service.getById(req.params.id)); }
  catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try { res.json(await service.update(req.params.id, req.body, req.user)); }
  catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try { await service.remove(req.params.id); res.json({ message: "User deleted" }); }
  catch (err) { next(err); }
};

exports.setUserStatus = async (req, res, next) => {
  try {
    const result = await service.setStatus(req.params.id, req.body.status, req.user.userId);
    res.json({ message: `User ${result.status}`, ...result });
  }
  catch (err) { next(err); }
};
