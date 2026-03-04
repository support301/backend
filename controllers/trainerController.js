import TrainerIdGenerator from "../middleware/trainerIdgenerator.js";
import Trainer from "../models/trainersModel.js";

class TrainerController {
    static createTrainer = async (req, res) => {
        try {
            const createdBy = req.user.id;
            const trainerId = await TrainerIdGenerator.generateTrainerId();
            const trainer = await Trainer.create({ ...req.body, trainerId, createdBy });
            res.status(201).json({
                success: true,
                message: "Trainer created successfully",
                data: trainer,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    };


    static getAllTrainers = async (req, res) => {
        try {
            const trainers = await Trainer.find().sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: trainers.length,
                data: trainers,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };


    // static getAllTrainers = async (req, res) => {
    //     try {
    //         const { id, adminType } = req.user;

    //         let trainers;

    //         if (adminType === "owner") {
    //             trainers = await Trainer.find()
    //                 .sort({ createdAt: -1 })
    //                 .populate("createdBy", "name email adminType");
    //         }

    //         else {
    //             trainers = await Trainer.find({ createdBy: id })
    //                 .sort({ createdAt: -1 })
    //                 .populate("createdBy", "name email adminType");
    //         }

    //         res.status(200).json({
    //             success: true,
    //             count: trainers.length,
    //             data: trainers,
    //         });

    //     } catch (error) {
    //         console.error("Error fetching trainers:", error);
    //         res.status(500).json({
    //             success: false,
    //             message: error.message,
    //         });
    //     }
    // };


    static getTrainerById = async (req, res) => {
        try {
            const trainer = await Trainer.findById(req.params.id);

            if (!trainer) {
                return res.status(404).json({
                    success: false,
                    message: "Trainer not found",
                });
            }

            res.status(200).json({
                success: true,
                data: trainer,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Invalid trainer ID",
            });
        }
    };


    static updateTrainer = async (req, res) => {
        try {
            const trainer = await Trainer.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!trainer) {
                return res.status(404).json({
                    success: false,
                    message: "Trainer not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Trainer updated successfully",
                data: trainer,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    };


    static deleteTrainer = async (req, res) => {
        try {
            const trainer = await Trainer.findByIdAndDelete(req.params.id);

            if (!trainer) {
                return res.status(404).json({
                    success: false,
                    message: "Trainer not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Trainer deleted successfully",
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Invalid trainer ID",
            });
        }
    }
}

export default TrainerController;