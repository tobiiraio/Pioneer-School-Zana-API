const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    NIN: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dateOfBirth: { type: Date },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    nationality: { type: String, default: "Ugandan" },
    department: { type: String },
    qualifications: { type: [String] },
    employmentDate: { type: Date },
    employmentStatus: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Probation", "Suspended", "Terminated"],
      default: "Full-time",
    },
    photo: { type: String, default: "" },
    idDocument: { type: String, default: "" },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "SchoolClass" }],
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
    emergencyContactRelationship: { type: String },
    isActive: { type: Boolean, default: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
