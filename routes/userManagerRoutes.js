import express from "express";
import UserManageController  from "../controllers/userManagerController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/getAllcount", verifyToken, UserManageController.getUserCounts);      
router.get("/getAll", verifyToken, UserManageController.getAllUsers);    
router.get("/getAllAdmins", verifyToken, UserManageController.getAllAdmins);      
router.put("/updateAdmin/:id", verifyToken, UserManageController.updateAdminType);       
router.delete("/deleteAdmin/:id", verifyToken, UserManageController.deleteUser);     
router.patch("/update/:id", verifyToken, UserManageController.updateUser );
router.get("/get/:id", verifyToken, UserManageController.getUserById );
router.post("/createUser", verifyToken, UserManageController.createUserByAdmin);

export default router;
