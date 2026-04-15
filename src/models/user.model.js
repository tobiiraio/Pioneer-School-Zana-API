const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["admin", "staff", "parent", "student"],
      required: true,
    },
    subrole: {
      type: String,
      enum: ["teacher", "bursar", "classteacher", "non-teaching"],
      default: null,
    },
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", default: null },
    status: {
      type: String,
      enum: ["active", "suspended", "deactivated"],
      default: "active",
    },
  },
  { timestamps: true }
);

userSchema.pre("validate", function (next) {
  if (this.role === "staff" && !this.subrole) {
    this.invalidate("subrole", "subrole is required for staff members");
  }
  if (this.role !== "staff" && this.subrole) {
    this.subrole = null;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);