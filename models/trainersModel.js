import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema(
    {
        trainerId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
        },

        email: {
            type: String,
            lowercase: true,
            unique: true,
        },

        phone: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "HOLD", "INACTIVE", "BLACKLISTED", "PENDING APPROVAL"],
            default: "PENDING APPROVAL",
            index: true,
        },

        experienceYears: {
            type: Number,
            min: 0,
            required: true,
        },

        education: {
            type: String,
            required: true,
        },

        professionalExperience: {
            type: Number,
            min: 0,
        },

        hourlyRate: {
            currency: {
                type: String,
                required: true,
            },
            min: {
                type: Number,
                required: true,
            },
            max: {
                type: Number,
                required: true,
            },
        },

        languages: {
            type: String,
        },

        quickSkills:{
            type: String,
            enum: ["IT", "SCHOOL CIRCULARS", "LANGUAGES", "DANCE", "MUSIC", "ARTS", "OTHERS", "HOBBY"],
            default: "IT",
        },

        skills: {
            type: [String],
            default: [],
        },
        subjects: {
            type: String,
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            // required: true,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Trainer", trainerSchema);
