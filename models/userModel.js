
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, match: /^\+\d{6,15}$/, unique: true, sparse: true },
  password: { type: String, required: true },
  profileImage: {
    data: Buffer,
    contentType: String,
  },
  customId: { type: String, unique: true },

  is_verified: { type: Boolean, default: false },
  status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED", "HOLD"], default: "PENDING" },

  roles: {
    type: [String],
    enum: ['student', 'instructor', 'admin'],
    default: ['admin']
  },

  adminType: {
    type: String,
    enum: ['owner', 'sales manager', 'training manager', 'BDE', "tutor Acquisition"],
    required: function () {
      // CREATE case
      if (this.roles) {
        return this.roles.includes('admin');
      }

      // UPDATE case
      if (this.getUpdate) {
        const update = this.getUpdate();
        const roles =
          update.roles ||
          update.$set?.roles;

        return roles?.includes('admin');
      }

      return false;
    },
  },

}, { timestamps: true });

const UserModel = model('User', userSchema);
export default UserModel;
