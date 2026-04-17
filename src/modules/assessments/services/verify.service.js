const reportService = require("./report.service");

// Delegates to the authenticated report service — same data, no additional auth.
// The physical document (QR code) is the access control.
exports.getPublicReport = async (studentId, termId) => {
  return reportService.getStudentReport(studentId, termId);
};
