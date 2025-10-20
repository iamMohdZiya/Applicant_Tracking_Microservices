const mongoose = require('mongoose');

// --- Sub-Schema for Company Contact Information ---
const ContactSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Contact email is required.'],
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    phone: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    }
}, { _id: false });

// --- Main Company Schema ---
const CompanySchema = new mongoose.Schema({
    // Unique ID for the company
    // Mongoose automatically creates _id, but we include companyId for clarity/API consistency
    companyId: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    name: {
        type: String,
        required: [true, 'Company name is required.'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Company description is required.']
    },
    industry: {
        type: String,
        trim: true,
        required: [true, 'Industry is required.']
    },
    // Location details
    headquarters: {
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true, default: 'USA' }
    },
    // Logo URL (often stored externally like S3)
    logoUrl: {
        type: String,
        trim: true
    },
    // Reference to the user who created/administers this company profile
    adminUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Admin user ID is required.'],
        index: true
    },
    contact: ContactSchema
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create an index on the company name for fast searches
CompanySchema.index({ name: 'text' });

// --- Model Export (CommonJS) ---
const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;
