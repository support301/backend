import express from "express";
import UserManageController  from "../controllers/userManagerController.js";

const router = express.Router();

router.get("/getAllcount", UserManageController.getUserCounts);      
router.get("/getAll", UserManageController.getAllUsers);    
router.get("/getAllAdmins", UserManageController.getAllAdmins);      
router.put("/updateAdmin/:id", UserManageController.updateAdminType);       
router.delete("/deleteAdmin/:id", UserManageController.deleteUser);     
router.patch("/update/:id", UserManageController.updateUser );
router.get("/get/:id", UserManageController.getUserById );
router.post("/createUser", UserManageController.createUserByAdmin);

export default router;
