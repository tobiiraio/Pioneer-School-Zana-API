const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    otherName: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    religion: { type: String },
    nationality: { type: String, default: "Ugandan" },
    address: { type: String },
    EMISNo: { type: String, unique: true },
    LINNumber: { type: String, unique: true },
    disabilities: [{ type: String }],
    immunized: { type: Boolean, default: false },
    allergies: [{ type: String }],
    photo: { type: String, default: "" },
    academicStatus: {
      type: String,
      enum: ["Active", "Inactive", "Graduated", "Transferred", "Suspended"],
      default: "Active",
    },
    currentClass: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass" },
    admissionDate: { type: Date, default: Date.now },
    parents: [
      {
        parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent" },
        relationship: { type: String, enum: ["Father", "Mother", "Guardian"] },
        isPrimaryContact: { type: Boolean, default: false },
      },
    ],
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

studentSchema.virtual("fullName").get(function () {
  return this.otherName
    ? `${this.firstName} ${this.otherName} ${this.lastName}`
    : `${this.firstName} ${this.lastName}`;
});
studentSchema.set("toJSON", { virtuals: true });
studentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Student", studentSchema);
