import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  address: string;
  messages: string[];
  tokensEarned: number;
}

const UserSchema: Schema = new Schema({
  address: { type: String, required: true, unique: true },
  messages: [String],
  tokensEarned: { type: Number, default: 0 },
});

export default mongoose.model<IUser>("User", UserSchema);
