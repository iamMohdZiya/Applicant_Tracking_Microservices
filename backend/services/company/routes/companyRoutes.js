const express = require('express');
const router = express.Router();

// Import controller functions (assuming your controllers file is one level up)
const {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany
} = require('../controllers/companyControllers');

// Note: In a real-world scenario, you would add middleware here
// e.g., requireAuth, checkRole('recruiter')

// --- Public/General Routes ---

// GET /api/companies - Get a list of all companies (with optional filtering)
router.get('/', getAllCompanies);

// GET /api/companies/:id - Get a single company by its custom ID
router.get('/:id', getCompanyById);


// --- Restricted/Admin Routes (Requires Authentication and Authorization Middleware) ---

// POST /api/companies - Create a new company profile
router.post('/', createCompany);

// PUT /api/companies/:id - Update an existing company profile
router.put('/:id', updateCompany);

// DELETE /api/companies/:id - Delete a company profile
router.delete('/:id', deleteCompany);


module.exports = router;


