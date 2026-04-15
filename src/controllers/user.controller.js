const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");

exports.getUsers = async (req, res) => {
  try {
    const { role, subrole, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (subrole) filter.subrole = subrole;
    if (status) filter.status = status;

    const users = await User.find(filter).select("-__v");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    if (requestingUser.role !== "admin" && requestingUser.userId !== id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (requestingUser.role !== "admin") {
      delete req.body.role;
      delete req.body.subrole;
      delete req.body.status;
    }

    const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await RefreshToken.deleteMany({ userId: req.params.id });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /users/:id/status  { status: "suspended" | "active" | "deactivated" }
exports.setUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["active", "suspended", "deactivated"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent admin from suspending themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ message: "You cannot change your own account status" });
    }

    user.status = status;
    await user.save();

    // Revoke all refresh tokens when suspending or deactivating
    if (status !== "active") {
      await RefreshToken.deleteMany({ userId: user._id });
    }

    res.json({ message: `User ${status}`, userId: user._id, status: user.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
