const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.getAll = async ({ role, subrole, status } = {}) => {
  const filter = {};
  if (role) filter.role = role;
  if (subrole) filter.subrole = subrole;
  if (status) filter.status = status;
  return User.find(filter).select("-__v");
};

exports.getById = async (id) => {
  const user = await User.findById(id).select("-__v");
  if (!user) throw err("User not found", 404);
  return user;
};

exports.update = async (id, data, requestingUser) => {
  if (requestingUser.role !== "admin" && requestingUser.userId !== id)
    throw err("Unauthorized", 403);
  if (requestingUser.role !== "admin") {
    delete data.role; delete data.subrole; delete data.status;
  }
  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select("-__v");
  if (!user) throw err("User not found", 404);
  return user;
};

exports.remove = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw err("User not found", 404);
  await RefreshToken.deleteMany({ userId: id });
};

exports.setStatus = async (id, status, requestingUserId) => {
  const allowed = ["active", "suspended", "deactivated"];
  if (!status || !allowed.includes(status))
    throw err(`status must be one of: ${allowed.join(", ")}`, 400);
  const user = await User.findById(id);
  if (!user) throw err("User not found", 404);
  if (user._id.toString() === requestingUserId)
    throw err("You cannot change your own account status", 400);
  user.status = status;
  await user.save();
  if (status !== "active") await RefreshToken.deleteMany({ userId: user._id });
  return { userId: user._id, status: user.status };
};
