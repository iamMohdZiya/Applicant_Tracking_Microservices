const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobControllers'); // Import controller functions

// NOTE: In a production microservice setup, you would add an authentication middleware
// here (e.g., const auth = require('../middleware/auth')) for private routes.

// --- Public Routes ---

// @route   GET /api/jobs
// @desc    Get all jobs (with search/filters)
// @access  Public
router.get('/', jobController.getAllJobs);

// @route   GET /api/jobs/:id
// @desc    Get a single job by ID
// @access  Public
router.get('/:id', jobController.getJobById);


// --- Private Routes (Requires Authentication/Authorization Middleware) ---

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Recruiter/Company)
// You would typically insert an auth middleware before jobController.createJob
router.post('/', jobController.createJob);

// @route   PUT /api/jobs/:id
// @desc    Update a job posting
// @access  Private (Recruiter/Company)
// You would typically insert an auth middleware before jobController.updateJob
router.put('/:id', jobController.updateJob);

// @route   DELETE /api/jobs/:id
// @desc    Delete a job posting
// @access  Private (Recruiter/Company)
// You would typically insert an auth middleware before jobController.deleteJob
router.delete('/:id', jobController.deleteJob);


module.exports = router;
