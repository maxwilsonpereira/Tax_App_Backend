import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  name: string;
  email: string;
  telephone: number;
  password: string;
  createdAt: Date;
  deletedAt: Date;
  deleted: boolean;
}
export const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: Number, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, required: true },
  deletedAt: { type: Date, default: null },
  deleted: { type: Boolean, default: false },
});

const User = mongoose.model<User>("User", UserSchema);
export default User;
