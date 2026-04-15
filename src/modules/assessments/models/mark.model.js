const mongoose = require("mongoose");

const markSchema = new mongoose.Schema(
  {
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    score: { type: Number, required: true, min: 0 },
    remarks: { type: String, default: "" },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

markSchema.index({ assessment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Mark", markSchema);
