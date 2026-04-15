// Public API for cross-module model imports — no router here to avoid circular deps
module.exports = {
  SchoolFees: require("./models/schoolfees.model"),
  Requirement: require("./models/requirement.model"),
  RequirementSet: require("./models/requirementSet.model"),
  RequirementFulfillment: require("./models/requirementFulfillment.model"),
};
