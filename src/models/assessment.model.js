const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["BOT", "MID", "EOT", "other"],
      required: true,
    },
    type: {
      type: String,
      enum: ["exam", "test", "assignment", "quiz", "practical"],
      required: true,
    },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    academicTerm: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicTerm", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    maxScore: { type: Number, required: true, min: 1 },
    date: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// One assessment per category+class+subject+term (prevent duplicates)
assessmentSchema.index(
  { category: 1, class: 1, subject: 1, academicTerm: 1 },
  { unique: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
