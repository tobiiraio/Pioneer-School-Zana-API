// Public API for cross-module model imports — no router here to avoid circular deps
module.exports = {
  Assessment: require("./models/assessment.model"),
  Mark: require("./models/mark.model"),
};
