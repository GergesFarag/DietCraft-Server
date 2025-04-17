import mongoose from "mongoose";
export enum goals {
  loseWeight,
  maintainWeight,
  gainWeight,
}
export const UserInfoSchema = new mongoose.Schema({
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  gender: { type: Boolean, default: true }, // true = male, false = female
  activityLevel: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true,
  },
  targetWeight: { type: Number, require: false },
  goal: { type: Number, enum: goals, required: true },
  calories: {type: Number , require: false},
});
