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
            required: true,
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
