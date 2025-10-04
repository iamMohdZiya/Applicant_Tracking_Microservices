const express = require('express');
const router = express.Router();
const applicantControllers = require('../controllers/applicantControllers');

// --- Applicant Profile Routes ---

// @route   POST /api/applicants
// @desc    Create a new applicant profile
// @access  Public
router.post('/', applicantControllers.createApplicant);

// @route   GET /api/applicants
// @desc    Get all applicants (filterable/searchable by recruiters)
// @access  Private (Recruiter/Matching Service)
router.get('/', applicantControllers.getAllApplicants);

// @route   GET /api/applicants/:id
// @desc    Get a single applicant profile by ID
// @access  Public (Self or authorized service access)
router.get('/:id', applicantControllers.getApplicantById);

// @route   PUT /api/applicants/:id
// @desc    Update an existing applicant profile
// @access  Private (Self or Admin)
router.put('/:id', applicantControllers.updateApplicant);

// @route   DELETE /api/applicants/:id
// @desc    Delete an applicant profile
// @access  Private (Admin)
router.delete('/:id', applicantControllers.deleteApplicant);

module.exports = router;