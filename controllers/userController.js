

import UserModel from '../models/userModel.js';
import bcrypt from 'bcrypt'
// import EmailVerificationModel from '../models/EmailVerification.js';
import sendEmailVerificationOTP from '../middleware/sendEmailOTP.js';
import EmailVerificationModel from '../models/EmailVerification.js';
import jwt from 'jsonwebtoken';
import transporter from '../config/emailConfig.js';
import crypto from 'crypto';

class UserController {
    static userRegistration = async (req, res) => {
        try {
            const { name, email, phoneNumber, password, password_confirmation } = req.body;

            if (!name || !email || !phoneNumber || !password || !password_confirmation) {
                return res.status(400).json({ status: "failed", message: "All fields are required" });
            }

            if (password !== password_confirmation) {
                return res.status(400).json({ status: "failed", message: "Password and Confirm Password don't match" });
            }

            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ status: "failed", message: "Email already exists" });
            }

  

            const hashedPassword = await bcrypt.hash(password, 10);
            const role = "admin";
            const newUser = await new UserModel({
                name,
                email,
                phoneNumber,
                adminType: "BDE",
                password: hashedPassword,
                customId: await UserController.generateCustomId(role)
            }).save();

            sendEmailVerificationOTP(req, newUser);
            res.status(201).json({
                status: "success",
                message: "Registration Success",
                user: { id: newUser._id, email: newUser.email }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "failed", message: "Unable to register, please try again later" });
        }
    };


    static verifyEmail = async (req, res) => {
        try {
            // Extract request body parameters
            const { email, otp } = req.body;

            // Check if all required fields are provided
            if (!email || !otp) {
                return res.status(400).json({ status: "failed", message: "All fields are required" });
            }

            const existingUser = await UserModel.findOne({ email });

            // Check if email doesn't exists
            if (!existingUser) {
                return res.status(404).json({ status: "failed", message: "Email doesn't exists" });
            }

            // Check if email is already verified
            if (existingUser.is_verified) {
                return res.status(400).json({ status: "failed", message: "Email is already verified" });
            }

            // Check if there is a matching email verification OTP
            const emailVerification = await EmailVerificationModel.findOne({ userId: existingUser._id, otp });
            if (!emailVerification) {
                if (!existingUser.is_verified) {
                    await sendEmailVerificationOTP(req, existingUser);
                    return res.status(400).json({ status: "failed", message: "Invalid OTP, new OTP sent to your email" });
                }
                return res.status(400).json({ status: "failed", message: "Invalid OTP" });
            }

            // Check if OTP is expired
            const currentTime = new Date();
            // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).

            const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
            if (currentTime > expirationTime) {
                // OTP expired, send new OTP
                await sendEmailVerificationOTP(req, existingUser);
                return res.status(400).json({ status: "failed", message: "OTP expired, new OTP sent to your email" });
            }

            // OTP is valid and not expired, mark email as verified
            existingUser.is_verified = true;
            await existingUser.save();

            // Delete email verification document
            await EmailVerificationModel.deleteMany({ userId: existingUser._id });

            return res.status(200).json({ status: "success", message: "Email verified successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "failed", message: "Unable to verify email, please try again later" });
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            // Check if email and password are provided
            if (!email || !password) {
                return res.status(400).json({ status: "failed", message: "Email and password are required" });
            }
            // Check if user exists
            const user = await UserModel.findOne({ email });

            if (!user) {
                return res.status(404).json({ status: "failed", message: "Invalid Email or Password" });
            }
            // Check if user is verified
            if (!user.is_verified) {
                return res.status(401).json({ status: "failed", message: "Your auth is not verified" });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return res.status(401).json({ status: "failed", message: "Invalid email or password" });
            }

            // Generate JWT Token
            const token = jwt.sign(
                { id: user._id, email: user.email, name: user.name, roles: user.roles, adminType: user.adminType },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.status(200).json({
                user: { id: user._id, email: user.email, name: user.name, roles: user.roles, adminType: user.adminType },
                status: "success",
                message: "Login successful",
                token,
                is_auth: true
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "failed", message: "Unable to login, please try again later" });
        }
    };

    // Profile
    static userProfile = async (req, res) => {
        const token = req.headers.authorization?.split(" ")[1];
        const SECRET_KEY = process.env.JWT_SECRET;
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Invalid or expired token." });
            }
            req.user = decoded;
        });
        const { id } = req.user;
        const user = await UserModel.findById(id).select("-password").lean();
        res.status(200).json({ data: user });
    }


    static changeUserPassword = async (req, res) => {
        try {

            const { email, currentpassword, password, password_confirmation } = req.body;
            const user = await UserModel.findOne({ email });

            if (!user) {
                return res.status(404).json({ status: "failed", message: "User not found" });
            }

            const isMatch = await bcrypt.compare(currentpassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ status: "failed", message: "Invalid current password" });
            }
            if (!password || !password_confirmation) {
                return res.status(400).json({ status: "failed", message: "New Password and Confirm New Password are required" });
            }

            if (password !== password_confirmation) {
                return res.status(400).json({ status: "failed", message: "New Password and Confirm New Password don't match" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            await UserModel.findByIdAndUpdate(user._id, { $set: { password: hashedPassword } });

            res.status(200).json({ status: "success", message: "Password changed successfully" });

        } catch (error) {
            console.error("Error changing password:", error);
            res.status(500).json({ status: "failed", message: "Unable to change password, please try again later" });
        }
    };

    static async updateUserDetails(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedUserDetails = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
            if (!updatedUserDetails) {
                return res.status(404).json({ message: "user not found" });
            }
            res.status(200).json({ message: "User updated successfully", user: updatedUserDetails });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Send Password Reset Link via Email
    static sendUserPasswordResetEmail = async (req, res) => {
        try {
            const { email } = req.body;
            // Check if email is provided
            if (!email) {
                return res.status(400).json({ status: "failed", message: "Email field is required" });
            }
            // Find user by email
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ status: "failed", message: "Email doesn't exist" });
            }
            // Generate token for password reset
            const secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' });
            // Reset Link
            const resetLink = `${process.env.FRONTEND_HOST}/auth/reset-password-confirm/${user._id}/${token}`;

            // Send password reset email  
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: "Arun - Password Reset Link",
                html: `<p>Hello ${user.name},</p>
    <p>We received a request to reset your password for your <strong>Arun</strong> account.</p>
    <p>Please <a href="${resetLink}">click here</a> to reset your password.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <p>- The Arun Team</p>`
            });
            // Send success response
            res.status(200).json({ status: "success", message: "Password reset email sent. Please check your email." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "failed", message: "Unable to send password reset email. Please try again later." });
        }
    }

    // Password Reset
    static userPasswordReset = async (req, res) => {
        try {
            const { password, password_confirmation } = req.body;
            const { id, token } = req.params;

            // Find user by ID
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({ status: "failed", message: "User not found" });
            }

            // Validate reset token
            const new_secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
            jwt.verify(token, new_secret);

            // Validate inputs
            if (!password || !password_confirmation) {
                return res.status(400).json({ status: "failed", message: "New Password and Confirm New Password are required" });
            }

            if (password !== password_confirmation) {
                return res.status(400).json({ status: "failed", message: "New Password and Confirm New Password don't match" });
            }

            // ✅ Hash the new password securely
            const newHashPassword = await bcrypt.hash(password, 10);

            // ✅ Update user's password
            await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } });

            res.status(200).json({ status: "success", message: "Password reset successfully" });

        } catch (error) {
            console.error("Error during password reset:", error);
            if (error.name === "TokenExpiredError") {
                return res.status(400).json({
                    status: "failed",
                    message: "Token expired. Please request a new password reset link."
                });
            }
            return res.status(500).json({
                status: "failed",
                message: "Unable to reset password. Please try again later."
            });
        }
    };



    //logout
    static userLogout = async (req, res) => {

        try {
            // 1. Clear cookies (must match how they were set)
            res.clearCookie('verifyToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            });

            res.clearCookie('is_auth', {
                path: '/'
            });


            // 2. Destroy session (if using sessions)
            if (req.session) {
                req.session.destroy((err) => {
                    if (err) {
                        console.error("[Logout] Session destruction failed:", err);
                        throw new Error("Session destruction failed");
                    }
                });
            }

            // 4. Send success response
            res.status(200).json({
                status: "success",
                message: "Logout successful"
            });

        } catch (error) {
            console.error("[Logout] Error during logout:", error);
            res.status(500).json({
                status: "failed",
                message: "Unable to logout, please try again later"
            });
        }
    };

    //check user role
    static checkUserRole = async (req, res) => {
        try {
            const user = req.user;
            res.status(200).json({ status: "success", message: "User role checked successfully", roles: user.roles });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "failed", message: "Unable to check user role, please try again later" });
        }
    }


    // update user profile
    static async updateUserProfile(req, res) {
        try {
            const id = req.params.id; // assuming you're using JWT middleware to attach user to req
            const { name, email, phoneNumber, profileImage } = req.body;

            // Validate input fields
            // if (!name || !email || !phoneNumber) {
            //   return res.status(400).json({ status: "failed", message: "All fields are required" });
            // }

            const updatedUser = await UserModel.findByIdAndUpdate(
                id, // ✅ fixed here
                { name, email, phoneNumber, profileImage },
                { new: true }
            );

            res.json({ status: "success", data: updatedUser });
            // console.log(updatedUser); // Optional logging
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "error", message: "Update failed." });
        }
    }


    static async generateCustomId(role) {
        const rolePrefixMap = {
            student: 'SI',
            instructor: 'II',
            admin: 'AI',
        };

        const prefix = rolePrefixMap[role];
        if (!prefix) throw new Error('Invalid role for ID generation');

        const latestUser = await UserModel.findOne({ roles: role })
            .sort({ createdAt: -1 })
            .select('customId');

        let number = 1;
        if (latestUser && latestUser.customId) {
            const match = latestUser.customId.match(/\d+$/);
            if (match) {
                number = parseInt(match[0]) + 1;
            }
        }

        const paddedNumber = String(number).padStart(4, '0');
        return `${prefix}${paddedNumber}`;
    }

}

export default UserController;