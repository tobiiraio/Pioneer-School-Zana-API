// Public API for cross-module model imports — no router here to avoid circular deps
module.exports = {
  AcademicYear: require("./models/academicYear.model"),
  AcademicTerm: require("./models/academicTerm.model"),
  SchoolClass: require("./models/class.model"),
  Subject: require("./models/subject.model"),
};
