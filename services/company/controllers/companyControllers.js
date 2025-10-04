const Company = require('../model/companyModel'); // Assuming the schema model is exported from this path

/**
 * @desc Create a new Company profile
 * @route POST /api/companies
 * @access Private (Recruiter/Admin)
 */
exports.createCompany = async (req, res) => {
    try {
        // Ensure that required fields (name, description, industry, adminUserId) are in the request body
        const { name, description, industry, adminUserId, headquarters, contact } = req.body;

        // Simple validation check for required fields
        if (!name || !description || !industry || !adminUserId) {
            return res.status(400).json({
                success: false,
                message: 'Company name, description, industry, and admin user ID are required.'
            });
        }

        // Create the new company document
        const newCompany = await Company.create({
            name,
            description,
            industry,
            adminUserId,
            headquarters,
            contact
        });

        res.status(201).json({
            success: true,
            data: newCompany,
            message: 'Company profile created successfully.'
        });
    } catch (error) {
        // Handle MongoDB duplicate key error (code 11000) for unique fields (name)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: `Company with this name already exists.`
            });
        }
        console.error('Error creating company:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating company.',
            error: error.message
        });
    }
};

/**
 * @desc Get all Company profiles (Can be filtered/paginated)
 * @route GET /api/companies
 * @access Public (or Restricted based on middleware)
 */
exports.getAllCompanies = async (req, res) => {
    try {
        // Basic filtering example (e.g., /api/companies?industry=Tech)
        const filter = {};
        if (req.query.industry) {
            filter.industry = req.query.industry;
        }

        const companies = await Company.find(filter).select('-__v'); // Exclude the Mongoose version key

        res.status(200).json({
            success: true,
            count: companies.length,
            data: companies
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching companies.',
            error: error.message
        });
    }
};

/**
 * @desc Get a single Company profile by ID
 * @route GET /api/companies/:id
 * @access Public
 */
exports.getCompanyById = async (req, res) => {
    try {
        const company = await Company.findOne({ companyId: req.params.id }).select('-__v');

        if (!company) {
            return res.status(404).json({
                success: false,
                message: `Company not found with id ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: company
        });
    } catch (error) {
        console.error('Error fetching company by ID:', error);
        // Handle case where ID format is invalid (e.g., not a valid ObjectId format)
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid company ID format.' });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while fetching company.',
            error: error.message
        });
    }
};

/**
 * @desc Update a Company profile by ID
 * @route PUT /api/companies/:id
 * @access Private (Recruiter/Admin)
 */
exports.updateCompany = async (req, res) => {
    try {
        // Find the company using the custom companyId field
        let company = await Company.findOne({ companyId: req.params.id });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: `Company not found with id ${req.params.id}`
            });
        }

        // Perform the update
        company = await Company.findOneAndUpdate(
            { companyId: req.params.id },
            req.body,
            {
                new: true, // Return the updated document
                runValidators: true // Run schema validators on update
            }
        ).select('-__v');

        res.status(200).json({
            success: true,
            data: company,
            message: 'Company profile updated successfully.'
        });
    } catch (error) {
         // Handle MongoDB duplicate key error (code 11000) if updating name causes collision
         if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: `Another company with this name already exists.`
            });
        }
        console.error('Error updating company:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating company.',
            error: error.message
        });
    }
};

/**
 * @desc Delete a Company profile by ID
 * @route DELETE /api/companies/:id
 * @access Private (Recruiter/Admin)
 */
exports.deleteCompany = async (req, res) => {
    try {
        const company = await Company.findOneAndDelete({ companyId: req.params.id });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: `Company not found with id ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: {}, // Return empty data or the deleted document if preferred
            message: 'Company profile deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting company.',
            error: error.message
        });
    }
};
