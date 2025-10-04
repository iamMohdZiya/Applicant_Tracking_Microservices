const Applicant = require('../model/applicantSchema'); // Assuming correct path to your model

/**
 * @desc Create a new Applicant profile
 * @route POST /api/applicants
 * @access Public (Initial registration)
 */
exports.createApplicant = async (req, res) => {
    try {
        // Essential fields for initial creation
        const { authId, firstName, lastName, email } = req.body;

        if (!authId || !firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Basic user information (authId, name, email) is required.'
            });
        }

        const newApplicant = await Applicant.create(req.body);

        res.status(201).json({
            success: true,
            data: newApplicant,
            message: 'Applicant profile created successfully.'
        });
    } catch (error) {
        // Handle MongoDB duplicate key error (11000) for unique fields (email, authId)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An applicant with this email or Auth ID already exists.'
            });
        }
        console.error('Error creating applicant profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating applicant profile.',
            error: error.message
        });
    }
};

/**
 * @desc Get all Applicant profiles (searchable/filterable)
 * @route GET /api/applicants
 * @access Private (Recruiter/Matching Service)
 */
exports.getAllApplicants = async (req, res) => {
    try {
        // Simple search/filtering example based on query parameters
        const filters = {};
        if (req.query.skill) {
            // Case-insensitive search within the embedded skills array
            filters['skills.name'] = { $regex: req.query.skill, $options: 'i' };
        }
        if (req.query.location) {
            filters.currentLocation = { $regex: req.query.location, $options: 'i' };
        }
        // Pagination setup (basic)
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const applicants = await Applicant.find(filters)
            .limit(limit)
            .skip(skip)
            .select('-__v -experience -education'); // Exclude large fields for list view

        const totalCount = await Applicant.countDocuments(filters);

        res.status(200).json({
            success: true,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            data: applicants
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching applicants.',
            error: error.message
        });
    }
};

/**
 * @desc Get a single Applicant profile by ID
 * @route GET /api/applicants/:id
 * @access Public (Self/Matching Service)
 */
exports.getApplicantById = async (req, res) => {
    try {
        const applicant = await Applicant.findById(req.params.id).select('-__v');

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: `Applicant profile not found with ID ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: applicant
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid Applicant ID format.' });
        }
        console.error('Error fetching applicant by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching applicant.',
            error: error.message
        });
    }
};

/**
 * @desc Update an Applicant profile by ID
 * @route PUT /api/applicants/:id
 * @access Private (Self-update or Admin)
 */
exports.updateApplicant = async (req, res) => {
    try {
        const updatedApplicant = await Applicant.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true // Enforce validation rules during update
            }
        ).select('-__v');

        if (!updatedApplicant) {
            return res.status(404).json({
                success: false,
                message: `Applicant profile not found with ID ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: updatedApplicant,
            message: 'Applicant profile updated successfully.'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Email or Auth ID is already in use.' });
        }
        // Handle validation errors (e.g., failed enum check)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        console.error('Error updating applicant:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating applicant.',
            error: error.message
        });
    }
};

/**
 * @desc Delete an Applicant profile by ID
 * @route DELETE /api/applicants/:id
 * @access Private (Admin)
 */
exports.deleteApplicant = async (req, res) => {
    try {
        const applicant = await Applicant.findByIdAndDelete(req.params.id);

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: `Applicant profile not found with ID ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Applicant profile deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting applicant:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting applicant.',
            error: error.message
        });
    }
};