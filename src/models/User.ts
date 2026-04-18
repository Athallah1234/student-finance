import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    university: { type: String },
    major: { type: String },
    semester: { type: Number },
    avatar: { type: String },
    role: { type: String, default: 'student' },
    preferences: {
      currency: { type: String, default: 'IDR' },
      language: { type: String, default: 'id' },
      theme: { type: String, default: 'dark' },
    },
  },
  { timestamps: true }
);

const User = models.User || model('User', UserSchema);
export default User;
