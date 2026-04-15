const mongoose = require("mongoose");

const requirementItemSchema = new mongoose.Schema({
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: "Requirement", required: true },
  quantity: { type: Number, required: true, min: 0 },
});

const requirementSetSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  requirementItems: [requirementItemSchema],
  SchoolClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass", required: true },
  AcademicTerm: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicTerm", required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

requirementSetSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("RequirementSet", requirementSetSchema);
