const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    label:    { type: String, required: true, unique: true, trim: true },
    minScore: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 0 },
    remark:   { type: String, required: true, trim: true },
    points:   { type: Number, default: 0, min: 0 },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

gradeSchema.pre("validate", function (next) {
  if (this.minScore > this.maxScore)
    return next(new Error("minScore must be less than or equal to maxScore"));
  next();
});

module.exports = mongoose.model("Grade", gradeSchema);
