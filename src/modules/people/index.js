// Public API for cross-module model imports — no router here to avoid circular deps
module.exports = {
  Student: require("./models/student.model"),
  Staff: require("./models/staff.model"),
  Parent: require("./models/parent.model"),
};
