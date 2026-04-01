// ============================================================
// routes/masters.js — Master Setup Routes
// ============================================================
// These routes let the Admin set up the college hierarchy:
//   Institution → Campus → Department → Program
//
// All routes that CREATE or UPDATE data require:
//   - protect    (must be logged in)
//   - authorize('admin')  (must be an admin)
//
// GET routes are open to all logged-in users (so dropdowns work)
// ============================================================

const express    = require('express');
const router     = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Institution, Campus, Department } = require('../models/Institution');
const Program    = require('../models/Program');

// Shorthand: array of middleware for admin-only write operations
const adminOnly  = [protect, authorize('admin')];

// ====================
//   INSTITUTIONS
// ====================

// GET all institutions (any logged-in user)
router.get('/institutions', protect, async (req, res) => {
  try {
    const institutions = await Institution.find({ isActive: true }).sort('name');
    res.json(institutions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new institution (admin only)
router.post('/institutions', ...adminOnly, async (req, res) => {
  try {
    const institution = await Institution.create(req.body);
    res.status(201).json({ message: 'Institution created', institution });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Institution code already exists.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// ====================
//   CAMPUSES
// ====================

// GET all campuses (optionally filter by institution)
router.get('/campuses', protect, async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.institution) filter.institution = req.query.institution;
    
    const campuses = await Campus.find(filter)
      .populate('institution', 'name code')  // Replace ObjectId with institution name + code
      .sort('name');
    res.json(campuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create campus (admin only)
router.post('/campuses', ...adminOnly, async (req, res) => {
  try {
    const campus = await Campus.create(req.body);
    // Populate so the response includes institution details
    await campus.populate('institution', 'name code');
    res.status(201).json({ message: 'Campus created', campus });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ====================
//   DEPARTMENTS
// ====================

// GET all departments (optionally filter by campus)
router.get('/departments', protect, async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.campus) filter.campus = req.query.campus;

    const departments = await Department.find(filter)
      .populate({
        path: 'campus',
        populate: { path: 'institution', select: 'name code' },
      })
      .sort('name');
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create department (admin only)
router.post('/departments', ...adminOnly, async (req, res) => {
  try {
    const department = await Department.create(req.body);
    await department.populate({
      path: 'campus',
      populate: { path: 'institution', select: 'name code' },
    });
    res.status(201).json({ message: 'Department created', department });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ====================
//   PROGRAMS
// ====================

// GET all programs
router.get('/programs', protect, async (req, res) => {
  try {
    const programs = await Program.find({ isActive: true })
      .populate({
        path: 'department',
        populate: { path: 'campus', populate: { path: 'institution', select: 'name code' } },
      })
      .sort('name');
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single program (useful for seat availability display)
router.get('/programs/:id', protect, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id).populate('department');
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create program (admin only)
// KEY VALIDATION: sum of quota seats must exactly equal totalIntake
router.post('/programs', ...adminOnly, async (req, res) => {
  try {
    const { totalIntake, quotas } = req.body;

    if (!quotas || quotas.length === 0) {
      return res.status(400).json({ message: 'At least one quota must be defined.' });
    }

    // Sum all quota seat allocations
    const quotaTotal = quotas.reduce((sum, q) => sum + Number(q.totalSeats), 0);

    // Business rule: quota total MUST equal intake
    if (quotaTotal !== Number(totalIntake)) {
      return res.status(400).json({
        message: `Quota total (${quotaTotal}) must equal total intake (${totalIntake}). Please adjust your quota distribution.`,
      });
    }

    const program = await Program.create(req.body);
    await program.populate({
      path: 'department',
      populate: { path: 'campus', populate: { path: 'institution', select: 'name code' } },
    });

    res.status(201).json({ message: 'Program created successfully', program });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all users (admin only — for user management)
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find().select('-password').sort('name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create user (admin only — to add officers or management viewers)
router.post('/users', ...adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ message: 'Email already in use.' });
    const user = await User.create(req.body);
    res.status(201).json({
      message: 'User created',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
