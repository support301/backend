import Trainer from "../models/trainersModel.js";

class TrainerIdGenerator {
    static async generateTrainerId() {
        const prefix = "TR";

        const latestTrainer = await Trainer.findOne({})
            .sort({ createdAt: -1 })
            .select("trainerId");

        let number = 1;

        if (latestTrainer?.trainerId) {
            const match = latestTrainer.trainerId.match(/\d+$/);
            if (match) {
                number = parseInt(match[0], 10) + 1;
            }
        }

        const paddedNumber = String(number).padStart(4, "0");
        return `${prefix}${paddedNumber}`;
    }
}

export default TrainerIdGenerator;