const Job = require('../model/jobModel'); // Assuming the schema file is named job.schema.js and is in the same directory.

/**
 * @desc    Create a new Job Posting
 * @route   POST /api/jobs
 * @access  Private (Recruiter/Company only)
 */
exports.createJob = async (req, res) => {
    // In a real microservice environment, companyId and postedByUserId
    // would be verified against the Auth Service and Company Service.
    try {
        const newJob = new Job(req.body);
        const savedJob = await newJob.save();

        res.status(201).json({
            message: 'Job posted successfully.',
            job: savedJob
        });
    } catch (error) {
        console.error('Error creating job:', error);
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation failed.', details: error.message });
        }
        res.status(500).json({ message: 'Failed to create job posting.', error: error.message });
    }
};

/**
 * @desc    Get all Job Postings (with optional filters)
 * @route   GET /api/jobs
 * @access  Public
 */
exports.getAllJobs = async (req, res) => {
    try {
        // Simple filtering example based on query parameters
        const filters = { status: 'Open' }; // Default to only open jobs
        if (req.query.location) {
            // Using regex for partial, case-insensitive match on location
            filters.location = { $regex: req.query.location, $options: 'i' };
        }
        if (req.query.experience) {
            filters.experienceLevel = req.query.experience;
        }

        // Pagination setup
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const jobs = await Job.find(filters)
            .skip(skip)
            .limit(limit)
            .sort({ postedAt: -1 }); // Sort by newest first

        const totalJobs = await Job.countDocuments(filters);

        res.status(200).json({
            jobs,
            total: totalJobs,
            page,
            pages: Math.ceil(totalJobs / limit)
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Failed to retrieve job postings.', error: error.message });
    }
};

/**
 * @desc    Get a single Job Posting by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job posting not found.' });
        }

        res.status(200).json(job);
    } catch (error) {
        // Handle invalid MongoDB ID format
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid job ID format.' });
        }
        console.error('Error fetching job by ID:', error);
        res.status(500).json({ message: 'Failed to retrieve job posting.', error: error.message });
    }
};

/**
 * @desc    Update a Job Posting
 * @route   PUT /api/jobs/:id
 * @access  Private (Recruiter/Company only)
 */
exports.updateJob = async (req, res) => {
    // NOTE: In a production app, you must verify that the authenticated user (via JWT/Auth Service)
    // is the same user who posted the job (postedByUserId) or an admin.
    try {
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the updated document and run Mongoose validators
        );

        if (!updatedJob) {
            return res.status(404).json({ message: 'Job posting not found.' });
        }

        res.status(200).json({
            message: 'Job updated successfully.',
            job: updatedJob
        });
    } catch (error) {
        console.error('Error updating job:', error);
        // Handle validation errors on update
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation failed during update.', details: error.message });
        }
        res.status(500).json({ message: 'Failed to update job posting.', error: error.message });
    }
};

/**
 * @desc    Delete a Job Posting
 * @route   DELETE /api/jobs/:id
 * @access  Private (Recruiter/Company only)
 */
exports.deleteJob = async (req, res) => {
    // NOTE: Authorization checks are critical here.
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);

        if (!deletedJob) {
            return res.status(404).json({ message: 'Job posting not found.' });
        }

        res.status(200).json({ message: 'Job posting deleted successfully.' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: 'Failed to delete job posting.', error: error.message });
    }
};
