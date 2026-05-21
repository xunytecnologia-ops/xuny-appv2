import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  picture: String,
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  accessToken: String,
  refreshToken: String,
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    emailSignature: {
      type: String,
      default: '',
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  lastLogin: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
