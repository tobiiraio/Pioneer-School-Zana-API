const Assessment = require("../models/assessment.model");
const Staff = require("../models/staff.model");

// POST /assessments  (admin only)
exports.createAssessment = async (req, res) => {
  try {
    const { title, category, type, academicYear, academicTerm, class: classId, subject, maxScore, date } = req.body;

    const assessment = new Assessment({
      title, category, type, academicYear, academicTerm,
      class: classId, subject, maxScore, date,
      createdBy: req.user.userId,
    });

    await assessment.save();
    await assessment.populate(["academicYear", "academicTerm", "class", "subject", "createdBy"]);
    res.status(201).json(assessment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "An assessment for this category, class, subject and term already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// GET /assessments  (admin | teacher scoped to assigned classes | classteacher)
exports.getAssessments = async (req, res) => {
  try {
    const { role, subrole, userId } = req.user;
    const { termId, classId, subjectId } = req.query;

    const filter = {};
    if (termId) filter.academicTerm = termId;
    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;

    // Scope teacher to their assigned classes and subjects
    if (subrole === "teacher" || subrole === "classteacher") {
      const staff = await Staff.findOne({ user: userId });
      if (!staff) return res.status(403).json({ message: "Staff record not found" });

      if (subrole === "teacher") {
        filter.class = { $in: staff.classes };
        filter.subject = { $in: staff.subjects };
      } else {
        // classteacher sees all subjects in their assigned classes
        filter.class = { $in: staff.classes };
      }
    }

    const assessments = await Assessment.find(filter)
      .populate("academicYear", "name")
      .populate("academicTerm", "name")
      .populate("class", "name shortName")
      .populate("subject", "name")
      .populate("createdBy", "name")
      .sort({ date: -1 });

    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /assessments/:id
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate("academicYear", "name")
      .populate("academicTerm", "name")
      .populate("class", "name shortName")
      .populate("subject", "name")
      .populate("createdBy", "name");

    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /assessments/class/:classId
exports.getAssessmentsByClass = async (req, res) => {
  try {
    const { termId } = req.query;
    const filter = { class: req.params.classId };
    if (termId) filter.academicTerm = termId;

    const assessments = await Assessment.find(filter)
      .populate("academicTerm", "name")
      .populate("subject", "name")
      .sort({ date: 1 });

    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /assessments/term/:termId
exports.getAssessmentsByTerm = async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = { academicTerm: req.params.termId };
    if (classId) filter.class = classId;

    const assessments = await Assessment.find(filter)
      .populate("class", "name shortName")
      .populate("subject", "name")
      .sort({ date: 1 });

    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /assessments/:id  (admin only)
exports.updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(["academicYear", "academicTerm", "class", "subject"]);

    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "An assessment for this category, class, subject and term already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// DELETE /assessments/:id  (admin only)
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json({ message: "Assessment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
