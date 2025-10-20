const mongoose = require('mongoose');

// --- Sub-Schemas for embedded documents ---

// 1. Schema for user's skills
const ApplicantSkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    // Proficiency level reported by the user
    level: {
        type: String,
        enum: ['Basic', 'Intermediate', 'Proficient', 'Expert'],
        required: true
    },
    // Self-reported years of experience with this skill
    yearsExperience: {
        type: Number,
        min: 0,
        default: 0
    }
}, { _id: false });

// 2. Schema for user's work experience
const WorkExperienceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 255
    },
    companyName: {
        type: String,
        required: true,
        maxlength: 255
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        default: null // null if current job
    },
    description: {
        type: String
    },
    isCurrent: {
        type: Boolean,
        default: false
    }
}, { _id: false });

// 3. Schema for user's education
const EducationSchema = new mongoose.Schema({
    institution: {
        type: String,
        required: true,
        maxlength: 255
    },
    degree: {
        type: String,
        required: true,
        maxlength: 255
    },
    fieldOfStudy: {
        type: String,
        maxlength: 255
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    // Optional: GPA or Grade
    grade: {
        type: String
    }
}, { _id: false });


// --- Main Applicant Profile Schema ---

const ApplicantSchema = new mongoose.Schema({
    // Reference ID from the central Authentication/User Service
    authId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Authentication ID is required.'],
        unique: true,
        index: true
    },
    firstName: {
        type: String,
        required: [true, 'First name is required.'],
        trim: true,
        maxlength: 100
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required.'],
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'] // Basic email regex validation
    },
    headline: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    summary: {
        type: String,
        default: ''
    },
    currentLocation: {
        type: String,
        default: 'Not specified',
        index: true
    },
    // Job search preferences
    isSearching: {
        type: Boolean,
        default: true,
        index: true
    },
    preferredEmploymentTypes: {
        type: [String],
        enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'],
        default: ['Full-time']
    },
    // Salary expectations
    salaryExpectation: {
        min: {
            type: Number,
            min: 0
        },
        max: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            trim: true,
            uppercase: true,
            default: 'USD'
        }
    },
    // Primary fields for job matching
    skills: {
        type: [ApplicantSkillSchema],
        default: []
    },
    experience: {
        type: [WorkExperienceSchema],
        default: []
    },
    education: {
        type: [EducationSchema],
        default: []
    }
}, {
    timestamps: true
});


// --- Model Export (CommonJS) ---

const Applicant = mongoose.model('Applicant', ApplicantSchema);

module.exports = Applicant;