const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
require("dotenv").config();

exports.authenticate = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("status role subrole");
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.status === "suspended") return res.status(403).json({ message: "Account suspended" });
    if (user.status === "deactivated") return res.status(403).json({ message: "Account deactivated" });

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

exports.authorizeRole = (roles) => (req, res, next) => {
  const { role, subrole } = req.user;
  if (!roles.includes(role) && !roles.includes(subrole)) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};

// Verifies the requesting teacher/classteacher is assigned to the class in :classId param
exports.authorizeClassAccess = async (req, res, next) => {
  const { role, subrole, userId } = req.user;
  if (role === "admin") return next();

  if (subrole !== "teacher" && subrole !== "classteacher") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const classId = req.params.classId || req.params.id || req.body.classId;
  if (!classId) return res.status(400).json({ message: "classId is required" });

  try {
    const Staff = require("../models/staff.model");
    const staff = await Staff.findOne({ user: userId });
    if (!staff) return res.status(403).json({ message: "Staff record not found" });

    const assigned = staff.classes.map((c) => c.toString());
    if (!assigned.includes(classId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this class" });
    }
    req.staffRecord = staff;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};