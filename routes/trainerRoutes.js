import express from "express";
import  TrainerController  from "../controllers/trainerController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/createTrainer", verifyToken, TrainerController.createTrainer);      
router.get("/getAll", verifyToken, TrainerController.getAllTrainers);    
router.get("/getTrainer/:id", verifyToken, TrainerController.getTrainerById);      
router.put("/updateTrainer/:id", verifyToken, TrainerController.updateTrainer);       
router.delete("/deleteTrainer/:id", verifyToken, TrainerController.deleteTrainer);     

export default router;
