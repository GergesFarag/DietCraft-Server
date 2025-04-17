import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import { UserInfoSchema } from "./userInfo.schema";
import { imageSchema } from "./Image.model";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isActive: boolean;
  refreshToken: string;
  userData?: typeof UserInfoSchema;
  userImages?: string[];
}

const userShcema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: [true, "username is required"] },
    email: {
      type: String,
      unique: true,
      required: [true, "email is required"],
      validate: {
        validator: function(value:string){
          return this.isAdmin ? true : validator.isEmail(value);
        },
        message: "Please enter a valid email"
      }
    },
    password: {
      type: String,
      required: true,
      validate :{
        validator: function(value:string){
          return this.isAdmin ? true : value.length >= 8;
        },
        message: "Password must be at least 8 characters"
      },
      select: false,
    },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, required: false },
    userData: { type: UserInfoSchema, required: false },
    userImages : {type : [String] , required: false},
  },
  { timestamps: true }
);
userShcema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userShcema.methods.comparePasswords = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};
export const User = mongoose.model<IUser>("user", userShcema);
