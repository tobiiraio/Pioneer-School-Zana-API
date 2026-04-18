const Student = require("../models/student.model");
const Staff = require("../models/staff.model");
const Parent = require("../models/parent.model");

const err = (msg, status) => Object.assign(new Error(msg), { status });

exports.getPublicStudent = async (id) => {
  const student = await Student.findById(id)
    .select("firstName lastName otherName gender nationality academicStatus currentClass EMISNo admissionDate")
    .populate("currentClass", "name");
  if (!student) throw err("Record not found", 404);
  return student;
};

exports.getPublicStaff = async (id) => {
  const staff = await Staff.findById(id)
    .select("fullName gender nationality department employmentStatus isActive subjects classes")
    .populate("subjects", "name")
    .populate("classes", "name");
  if (!staff) throw err("Record not found", 404);
  return staff;
};

exports.getPublicParent = async (id) => {
  const parent = await Parent.findById(id)
    .select("fullName relationship nationality isPrimaryContact students")
    .populate("students", "firstName lastName EMISNo");
  if (!parent) throw err("Record not found", 404);
  return parent;
};
