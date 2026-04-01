// ============================================================
// routes/applicants.js — Applicant Management Routes
// ============================================================
// Handles everything related to creating and managing applicants.
//
// Routes:
//   GET  /api/applicants         → List all applicants
//   POST /api/applicants         → Create a new applicant
//   GET  /api/applicants/:id     → Get one applicant
//   PATCH /api/applicants/:id/documents → Update document status
//   PATCH /api/applicants/:id/fee       → Update fee status
//
// Who can access:
//   - admin and admission_officer can create/update
//   - management can only view (GET)
// ============================================================

const express   = require('express');
const router    = express.Router();
const Applicant = require('../models/Applicant');
const { protect, authorize } = require('../middleware/auth');

// Shorthand middleware combos
const allRoles       = [protect]; // any logged-in user
const officerOrAdmin = [protect, authorize('admin', 'admission_officer')];

// ----------------------------------
// GET /api/applicants
// ----------------------------------
// Returns all applicants.
// Supports optional query filters:
//   ?program=<id>    filter by program
//   ?quotaType=KCET  filter by quota
//   ?feeStatus=Pending  filter by fee status
// ----------------------------------
router.get('/', ...allRoles, async (req, res) => {
  try {
    // Build a filter object from query params
    const filter = {};
    if (req.query.program)    filter.program    = req.query.program;
    if (req.query.quotaType)  filter.quotaType  = req.query.quotaType;
    if (req.query.feeStatus)  filter.feeStatus  = req.query.feeStatus;
    if (req.query.documentStatus) filter.documentStatus = req.query.documentStatus;

    const applicants = await Applicant.find(filter)
      .populate('program', 'name code courseType')  // Include program details
      .populate('createdBy', 'name')                // Include who created it
      .sort({ createdAt: -1 });                     // Newest first

    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------
// POST /api/applicants
// ----------------------------------
// Body: all the applicant form fields
// Creates a new applicant record.
// ----------------------------------
router.post('/', ...officerOrAdmin, async (req, res) => {
  try {
    // Attach who created this record
    const applicantData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const applicant = await Applicant.create(applicantData);
    await applicant.populate('program', 'name code courseType');

    res.status(201).json({
      message: 'Applicant created successfully',
      applicant,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Extract all validation messages into one readable string
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(400).json({ message: err.message });
  }
});

// ----------------------------------
// GET /api/applicants/:id
// ----------------------------------
// Get one applicant's full details.
// ----------------------------------
router.get('/:id', ...allRoles, async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id)
      .populate({
        path: 'program',
        populate: {
          path: 'department',
          populate: { path: 'campus', populate: { path: 'institution' } },
        },
      })
      .populate('createdBy', 'name email');

    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found.' });
    }

    res.json(applicant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------
// PATCH /api/applicants/:id/documents
// ----------------------------------
// Body: { documentStatus: "Submitted" | "Verified" | "Pending" }
// Updates only the document verification status.
// ----------------------------------
router.patch('/:id/documents', ...officerOrAdmin, async (req, res) => {
  try {
    const { documentStatus } = req.body;
    const allowed = ['Pending', 'Submitted', 'Verified'];

    if (!allowed.includes(documentStatus)) {
      return res.status(400).json({ message: `documentStatus must be one of: ${allowed.join(', ')}` });
    }

    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { documentStatus },
      { new: true } // Return the UPDATED document (not the old one)
    ).populate('program', 'name code');

    if (!applicant) return res.status(404).json({ message: 'Applicant not found.' });

    res.json({ message: `Document status updated to "${documentStatus}"`, applicant });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------------------------
// PATCH /api/applicants/:id/fee
// ----------------------------------
// Body: { feeStatus: "Paid" | "Pending" }
// Updates the fee payment status.
// ----------------------------------
router.patch('/:id/fee', ...officerOrAdmin, async (req, res) => {
  try {
    const { feeStatus } = req.body;
    const allowed = ['Pending', 'Paid'];

    if (!allowed.includes(feeStatus)) {
      return res.status(400).json({ message: `feeStatus must be one of: ${allowed.join(', ')}` });
    }

    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { feeStatus },
      { new: true }
    ).populate('program', 'name code');

    if (!applicant) return res.status(404).json({ message: 'Applicant not found.' });

    res.json({ message: `Fee status updated to "${feeStatus}"`, applicant });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
