// ============================================================
// routes/admissions.js — Seat Allocation, Confirmation & Dashboard
// ============================================================
// This is the MOST IMPORTANT file. It contains the core business logic.
//
// Routes:
//   POST /api/admissions/allocate/:applicantId  → Lock a seat
//   POST /api/admissions/confirm/:applicantId   → Confirm & generate admission number
//   GET  /api/admissions/dashboard              → Get dashboard stats
//
// KEY RULES ENFORCED HERE:
//   Rule 1: Can't allocate if quota is already full
//   Rule 2: Admission number is generated ONCE and never changes
//   Rule 3: Admission only confirmed after fee is paid
//   Rule 4: Seat counters update immediately (real-time)
// ============================================================

const express   = require('express');
const router    = express.Router();
const Applicant = require('../models/Applicant');
const Program   = require('../models/Program');
const { protect, authorize } = require('../middleware/auth');

const officerOrAdmin = [protect, authorize('admin', 'admission_officer')];
const allRoles       = [protect];

// ============================================================
// POST /api/admissions/allocate/:applicantId
// ============================================================
// ALLOCATE SEAT — Locks a quota seat for this applicant.
//
// Step-by-step logic:
//   1. Find the applicant
//   2. Find the program they applied for
//   3. Find their specific quota in that program (KCET/COMEDK/Management)
//   4. Check: is filledSeats < totalSeats? If not, BLOCK.
//   5. Increment filledSeats (real-time counter update)
//   6. Mark applicant.seatAllocated = true
// ============================================================
router.post('/allocate/:applicantId', ...officerOrAdmin, async (req, res) => {
  try {
    // Step 1: Find the applicant
    const applicant = await Applicant.findById(req.params.applicantId);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found.' });
    }

    // Prevent double-allocation
    if (applicant.seatAllocated) {
      return res.status(400).json({ message: 'A seat has already been allocated to this applicant.' });
    }

    // Step 2: Find the program
    const program = await Program.findById(applicant.program);
    if (!program) {
      return res.status(404).json({ message: 'Program not found. It may have been deleted.' });
    }

    // Step 3: Find the specific quota sub-document
    // .find() on an array returns the matching element
    const quota = program.quotas.find(q => q.name === applicant.quotaType);
    if (!quota) {
      return res.status(400).json({
        message: `Quota "${applicant.quotaType}" is not configured for this program.`,
      });
    }

    // Step 4: BLOCK if quota is full — THIS IS THE CRITICAL RULE
    if (quota.filledSeats >= quota.totalSeats) {
      return res.status(400).json({
        message: `❌ Seat allocation failed. The ${applicant.quotaType} quota for ${program.name} is full. (${quota.filledSeats}/${quota.totalSeats} seats filled)`,
        quotaStatus: {
          quota:       quota.name,
          totalSeats:  quota.totalSeats,
          filledSeats: quota.filledSeats,
          available:   0,
        },
      });
    }

    // Step 5: Increment filled seats in the program's quota
    // We modify the sub-document and save the parent (program)
    quota.filledSeats += 1;
    await program.save();

    // Step 6: Mark applicant's seat as allocated
    applicant.seatAllocated = true;
    await applicant.save();

    res.json({
      message: `✅ Seat allocated successfully in ${applicant.quotaType} quota!`,
      applicant,
      remainingSeats: quota.totalSeats - quota.filledSeats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// POST /api/admissions/confirm/:applicantId
// ============================================================
// CONFIRM ADMISSION — Generates the admission number.
//
// Prerequisites (in order):
//   1. Seat must be allocated
//   2. Fee must be Paid
//   3. Admission number must not already exist (immutability)
//
// Admission Number Format: INST/2026/UG/CSE/KCET/0001
//   - INST    = institution code
//   - 2026    = current year
//   - UG      = course type
//   - CSE     = program code
//   - KCET    = quota type
//   - 0001    = sequential number (padded to 4 digits)
// ============================================================
router.post('/confirm/:applicantId', ...officerOrAdmin, async (req, res) => {
  try {
    // Populate program and its department chain for institution code
    const applicant = await Applicant.findById(req.params.applicantId).populate({
      path: 'program',
      populate: {
        path: 'department',
        populate: {
          path: 'campus',
          populate: { path: 'institution', select: 'code name' },
        },
      },
    });

    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found.' });
    }

    // Rule: Immutability — can't confirm twice
    if (applicant.admissionNumber) {
      return res.status(400).json({
        message: 'Admission has already been confirmed.',
        admissionNumber: applicant.admissionNumber,
      });
    }

    // Rule: Seat must be allocated first
    if (!applicant.seatAllocated) {
      return res.status(400).json({
        message: 'Cannot confirm admission: seat has not been allocated yet.',
      });
    }

    // Rule: Fee must be paid before confirmation
    if (applicant.feeStatus !== 'Paid') {
      return res.status(400).json({
        message: '❌ Cannot confirm admission: fee payment is still pending. Mark fee as Paid first.',
      });
    }

    // Build the admission number
    const program = applicant.program;
    const institution = program.department?.campus?.institution;
    const institutionCode = institution?.code || 'INST';
    const year = new Date().getFullYear();

    // Count how many students have ALREADY been confirmed in
    // the same program + quota combination (to get the sequence number)
    const confirmedCount = await Applicant.countDocuments({
      program: program._id,
      quotaType: applicant.quotaType,
      admissionNumber: { $exists: true, $ne: null },
    });

    // Sequence number: confirmedCount + 1, padded to 4 digits
    // e.g., 0 + 1 = 1 → "0001"
    const sequence = String(confirmedCount + 1).padStart(4, '0');

    // Final format: INST/2026/UG/CSE/KCET/0001
    const admissionNumber = `${institutionCode}/${year}/${program.courseType}/${program.code}/${applicant.quotaType}/${sequence}`;

    // Save the admission number permanently (never changes after this)
    applicant.admissionNumber = admissionNumber;
    await applicant.save();

    res.json({
      message: '🎉 Admission confirmed successfully!',
      admissionNumber,
      applicant,
    });
  } catch (err) {
    // Handle rare race condition where two requests try to confirm simultaneously
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Admission number conflict. Please try again.',
      });
    }
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// GET /api/admissions/dashboard
// ============================================================
// Returns aggregated statistics for the dashboard.
// All roles can access this.
// ============================================================
router.get('/dashboard', ...allRoles, async (req, res) => {
  try {
    const programs   = await Program.find({ isActive: true }).populate({
      path: 'department',
      populate: { path: 'campus', populate: { path: 'institution', select: 'name' } },
    });
    const applicants = await Applicant.find();

    // Build per-program stats
    const programStats = programs.map(p => {
      const programApplicants = applicants.filter(
        a => a.program.toString() === p._id.toString()
      );

      return {
        id:           p._id,
        program:      p.name,
        code:         p.code,
        courseType:   p.courseType,
        academicYear: p.academicYear,
        totalIntake:  p.totalIntake,

        // Admitted = has an admission number (fully confirmed)
        totalAdmitted: programApplicants.filter(a => a.admissionNumber).length,

        // Allocated = seat locked but not yet fully confirmed
        totalAllocated: programApplicants.filter(a => a.seatAllocated).length,

        quotas: p.quotas.map(q => ({
          name:      q.name,
          total:     q.totalSeats,
          filled:    q.filledSeats,
          remaining: q.totalSeats - q.filledSeats,
          // Percentage filled (for progress bars in the UI)
          fillPercent: q.totalSeats > 0 ? Math.round((q.filledSeats / q.totalSeats) * 100) : 0,
        })),
      };
    });

    // Summary numbers for the top cards on the dashboard
    const totalApplicants    = applicants.length;
    const totalAdmitted      = applicants.filter(a => a.admissionNumber).length;
    const pendingDocs        = applicants.filter(a => a.documentStatus !== 'Verified').length;
    const pendingFees        = applicants.filter(a => a.feeStatus === 'Pending' && a.seatAllocated).length;
    const seatsAllocated     = applicants.filter(a => a.seatAllocated).length;

    res.json({
      summary: {
        totalApplicants,
        totalAdmitted,
        seatsAllocated,
        pendingDocs,
        pendingFees,
      },
      programs: programStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// GET /api/admissions/seat-status/:programId
// ============================================================
// Quick check of seat availability for a specific program.
// Used by the frontend before showing allocation buttons.
// ============================================================
router.get('/seat-status/:programId', ...allRoles, async (req, res) => {
  try {
    const program = await Program.findById(req.params.programId);
    if (!program) return res.status(404).json({ message: 'Program not found.' });

    const quotaStatus = program.quotas.map(q => ({
      name:      q.name,
      total:     q.totalSeats,
      filled:    q.filledSeats,
      remaining: q.totalSeats - q.filledSeats,
      isFull:    q.filledSeats >= q.totalSeats,
    }));

    res.json({ program: program.name, quotaStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
