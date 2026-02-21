import UserModel from "../models/userModel.js";
import bcrypt from 'bcrypt'

class UserManageController {
  static async getUserCounts(req, res) {
    try {
      // Count total users
      const totalUsers = await UserModel.countDocuments();

      // Count students
      const studentCount = await UserModel.countDocuments({
        roles: { $in: ["student"] },
      });

      // Count instructors
      const teacherCount = await UserModel.countDocuments({
        roles: { $in: ["instructor"] },
      });

      // Count employees
      const employeeCount = await UserModel.countDocuments({
        roles: { $in: ["employee"] },
      });

      res.status(200).json({
        status: "success",
        data: {
          totalUsers,
          studentCount,
          teacherCount,
          employeeCount,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Error fetching user counts",
        error: error.message,
      });
    }
  }


  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.find().select("name email roles status adminType");

      res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Error fetching all users",
        error: error.message,
      });
    }
  }


  static createUserByAdmin = async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phoneNumber,
        roles = ["admin"],
        adminType,
        status,
      } = req.body;

      // 🔴 Basic validation
      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email and password are required",
        });
      }

      // 🔴 Check duplicate email
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      // 🔐 Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 🆕 Create user
      const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        roles,
        adminType,
        status,
      });

      // 🚫 Never send password back
      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(201).json({
        message: "User created successfully",
        user: userResponse,
      });
    } catch (error) {
      console.error("Create User Error:", error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };

  static updateUser = async (req, res) => {
    try {

      const { id } = req.params;

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,          // return updated document
          runValidators: true // validate schema rules
        }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });

    } catch (error) {
      console.error("Update User Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: error.message,
      });
    }
  };

  static async getAllAdmins(req, res) {
    try {
      const admin = await UserModel.find({
        roles: { $in: ["admin"] },
      }).select("name email customId phoneNumber profileImage adminType");
      res.status(200).json({
        status: "success",
        data: admin,
      });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Error fetching admins",
        error: error.message,
      });
    }
  }

  static getUserById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const user = await UserModel.findById(id).select(
        "-password -__v"
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("❌ Get User By ID Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }


  static async updateAdminType(req, res) {
    const { userId } = req.params;
    const { adminType } = req.body;

    const validTypes = ["owner", "crm", "poc", "manager"];
    if (!validTypes.includes(adminType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid admin type" });
    }

    try {
      const user = await UserModel.findById(userId);

      if (!user || !user.roles.includes("admin")) {
        return res
          .status(404)
          .json({ success: false, message: "Admin user not found" });
      }

      user.adminType = adminType;
      await user.save();

      res
        .status(200)
        .json({
          success: true,
          message: "Admin type updated successfully",
          user,
        });
    } catch (error) {
      console.error("Error updating admin type:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }


  static async deleteUser(req, res) {
    const { id } = req.params;
    try {
      const deletedUser = await UserModel.findByIdAndDelete(id);
      console.log("Deleted user:", deletedUser);
      if (!deletedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

}

export default UserManageController;
