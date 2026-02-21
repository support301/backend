import express from 'express'
const router = express.Router();
import UserController from '../controllers/userController.js'
import verifyToken from '../middleware/verifyToken.js';


router.post("/register", UserController.userRegistration)
router.post('/verify-email', UserController.verifyEmail)
router.post('/login', UserController.userLogin)
router.post('/reset-password-link', UserController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token', UserController.userPasswordReset)
router.put('/:id', UserController.updateUserProfile)
//protected route

router.get('/me/:id' , verifyToken, UserController.userProfile)
router.put('/:id' , verifyToken, UserController.userProfile)
router.post('/change-password', verifyToken, UserController.changeUserPassword)
router.post('/logout', verifyToken, UserController.userLogout)
router.get('/check-role', verifyToken, UserController.checkUserRole)

export default router;
