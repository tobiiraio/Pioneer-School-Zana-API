const mongoose = require("mongoose");

const schoolFeesSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    academicTerm: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicTerm", required: true },
    studentClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass", required: true },
    date: { type: Date, required: true, default: Date.now },
    bf: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    rn: { type: String },
    bal: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

schoolFeesSchema.index({ student: 1, academicTerm: 1, date: 1 });

schoolFeesSchema.statics.getStudentTransactions = function (studentId, termId) {
  return this.find({ student: studentId, academicTerm: termId })
    .populate("student", "firstName lastName otherName fullName")
    .sort({ date: 1 });
};

schoolFeesSchema.statics.getAllTransactionsWithStudents = function (filter = {}) {
  return this.find(filter)
    .populate("student", "firstName lastName otherName fullName")
    .populate("academicTerm", "name")
    .populate("studentClass", "name")
    .sort({ date: -1 });
};

schoolFeesSchema.statics.getCurrentBalance = async function (studentId, termId) {
  const last = await this.findOne({ student: studentId, academicTerm: termId }).sort({ date: -1 });
  return last ? last.bal : 0;
};

module.exports = mongoose.model("SchoolFees", schoolFeesSchema);
