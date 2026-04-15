const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    NIN: { type: String, required: true },
    occupation: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    nationality: { type: String, default: "Ugandan" },
    photo: { type: String, default: "" },
    idDocument: { type: String, default: "" },
    relationship: {
      type: String,
      enum: ["Father", "Mother", "Guardian"],
      required: true,
    },
    guardianRelationship: {
      type: String,
      required: function () { return this.relationship === "Guardian"; },
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    alternatePhone: { type: String, default: "" },
    isPrimaryContact: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parent", parentSchema);
