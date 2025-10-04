const mongoose = require('mongoose');

// --- Sub-Schemas for embedded documents ---

// Schema for required/preferred skills
// This structure is crucial for the matching service to compare against applicant skills.
const JobSkillSchema = new mongoose.Schema({
    // Name of the skill (e.g., 'Python', 'NestJS', 'PostgreSQL')
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    // Whether the skill is strictly required or just preferred
    isMandatory: {
        type: Boolean,
        required: true,
        default: true
    },
    // Required proficiency level (e.g., 'Novice', 'Proficient', 'Expert')
    levelRequired: {
        type: String,
        enum: ['Basic', 'Intermediate', 'Proficient', 'Expert'],
        default: 'Intermediate'
    }
}, { _id: false }); // No individual ID needed for embedded docs

// Schema for job benefits
const JobBenefitSchema = new mongoose.Schema({
    // Name of the benefit (e.g., '401k Match', 'Health Insurance', 'Remote Work')
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    }
}, { _id: false }); // No individual ID needed for embedded docs


// --- Main Job Schema ---

const JobSchema = new mongoose.Schema({
    // Reference ID for the Company entity (owned by a separate Company microservice)
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Company ID is required.'],
        index: true
    },
    // The ID of the user/recruiter who created the post.
    postedByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Posting user ID is required.']
    },
    title: {
        type: String,
        required: [true, 'Job title is required.'],
        trim: true,
        maxlength: 255
    },
    description: {
        type: String,
        required: [true, 'Job description is required.']
    },
    // Job location (indexed for fast search/filtering)
    location: {
        type: String,
        required: [true, 'Location is required.'],
        trim: true,
        index: true
    },
    // Type of employment (e.g., 'Full-time')
    employmentType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'],
        required: [true, 'Employment type is required.']
    },
    // Experience Level (indexed for fast filtering)
    experienceLevel: {
        type: String,
        enum: ['Entry-Level', 'Mid-Level', 'Senior', 'Lead', 'Executive'],
        required: [true, 'Experience level is required.'],
        index: true
    },
    // Salary range (optional)
    salary: {
        min: {
            type: Number,
            min: 0,
            default: null
        },
        max: {
            type: Number,
            min: 0,
            default: null
        },
        currency: {
            type: String,
            trim: true,
            uppercase: true,
            default: 'USD'
        }
    },
    // Embedded array of required/preferred skills
    requiredSkills: {
        type: [JobSkillSchema],
        default: []
    },
    // Embedded array of job benefits
    benefits: {
        type: [JobBenefitSchema],
        default: []
    },
    // Status of the job posting (indexed for fast filtering)
    status: {
        type: String,
        enum: ['Open', 'Closed', 'Filled', 'Draft', 'Archived'],
        default: 'Open',
        index: true
    },
    // Date the job is valid through
    validThrough: {
        type: Date,
        default: null
    }

}, {
    // Automatically manage createdAt and updatedAt fields
    timestamps: true
});

// Compound text index for full-text search capability
JobSchema.index({ title: 'text', description: 'text' });


// --- Model Export (CommonJS) ---

const Job = mongoose.model('Job', JobSchema);

module.exports = Job;
