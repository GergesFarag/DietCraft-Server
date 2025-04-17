import { IUser, User } from "../models/Iuser.model";
import { Request, Response, NextFunction, CookieOptions } from "express";
import { catchError } from "../utils/catchError";
import { generateTokens, updateAccessToken } from "./auth.controller";
import { calculateCalories } from "../utils/caloriesCalc";
import { ObjectId } from "mongoose";
import { CustomError } from "../utils/error.handler";
import { HttpStatus } from "../utils/HttpStatus";
import { Image } from "../models/Image.model";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import cloudinary from "../config/cloudinary.config";
import dotenv from "dotenv";
dotenv.config();
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: (process.env.MODE as string) === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const register = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const isExist = await User.findOne({ email });
    if (isExist && isExist.isActive) {
      res.status(400).json({ message: "Cannot Use These Credentials" , data: null });
      return;
    }
    const newUser = new User({ ...req.body });
    const refreshToken = generateTokens(newUser, false);
    const accessToken = generateTokens(newUser, true);
    newUser.refreshToken = refreshToken;
    await newUser.save();
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(201).json({
      message: "User Created Successfully !",
      data: { accessToken: accessToken, user: newUser },
    });
  }
);
const login = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(400).json({ message: "Invalid Email or Password" });
      return;
    }
    //@ts-ignore
    const isMatch = await user.comparePasswords(password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid Email or Password" });
      return;
    }
    const refreshToken = generateTokens(user, false);
    const accessToken = generateTokens(user, true);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(200).json({
      message: "User Logged In Successfully !",
      data: { accessToken: accessToken, user: user },
    });
  }
);
const logout = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const refToken: string = req.cookies.refreshToken;
    console.log(refToken);
    if (!refToken) {
      res.status(400).json({ message: "You're Not Logged In" });
      return;
    }
    const user = await User.findOne({ refreshToken: refToken });
    user!.refreshToken = "";
    await user!.save();
    res.clearCookie("refreshToken", cookieOptions);
    res.status(200).json({ message: "User Logged Out Successfully !" });
  }
);
const deleteUser = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (user?.isAdmin) {
      return next(
        new CustomError(
          "Forbidden",
          "Cannot Delete Admin",
          HttpStatus.FORBIDDEN
        )
      );
    }
    if (!user) {
      res.status(400).json({ message: "Invalid User" });
      return;
    }
    user.isActive = false;
    await user.save();
    res.status(200).json({ message: "User Deleted Successfully !" });
  }
);
const getAllUsers = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find().where("isActive").equals(true);
    if (users) {
      res.status(200).json({ message: "All Users Got", data: users });
      return;
    }
    next(new Error("No Users Found"));
  }
);
const addUserInfo = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { age, weight, height, gender, activityLevel, goal = 1 , targetWeight } = req.body;
    if (!age || !weight || !height || !gender || !activityLevel) {
      return next(new Error("Invalid Data Provided"));
    }
    let calories = Math.round(
      calculateCalories(age, weight, height, gender, activityLevel, goal)
    );

    const user = await User.findByIdAndUpdate(
      //@ts-ignore
      req.data.id,
      {
        $set: {
          "userData.age": age,
          "userData.weight": weight,
          "userData.height": height,
          "userData.gender": gender,
          "userData.activityLevel": activityLevel,
          "userData.goal": goal,
          "userData.calories": calories,
          "userData.targetWeight": targetWeight,
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new Error("Invalid User"));
    }
    res.status(200).json({
      message: "User Info Added Successfully",
      data: user.userData,
    });
  }
);
const getUserInfo = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user = await User.findById(req.data.id).select("userData");
    if (!user) {
      return next(new CustomError("Invalid User" , "User Not Found", HttpStatus.NOT_FOUND));
    }
    res.status(200).json({
      message: "User Info Got Successfully",
      data: user.userData,
    });
  }
)
const updateUserInfo = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.body).length === 0)
      next(new Error("Invalid User Info"));
    const updatingFields = { ...req.body };
    //@ts-ignore
    const user = await User.findById(req.data.id as ObjectId);
    if (user) {
      Object.keys(updatingFields).forEach((field: any) => {
        //@ts-ignore
        user.userData[field] = updatingFields[field];
      });
      //@ts-ignore
      const { age, weight, height, gender, activityLevel, goal } =
        user.userData;
      let calories = Math.round(
        calculateCalories(age, weight, height, gender, activityLevel, goal)
      );
      //@ts-ignore
      user.userData.calories = calories;
      await user.save();
      res.status(200).json({
        message: "User Info Updated Successfully",
        data: user.userData,
      });
    }
  }
);
const uploadImage = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const userID = req.data.id;
    //@ts-ignore
    if (!req.file) {
      return next(
        new CustomError(
          "Invalid File",
          "File Not Found",
          HttpStatus.BAD_REQUEST
        )
      );
    }

    const imageDoc = await Image.create({
      userId: userID,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    if (!imageDoc) {
      return next(
        new CustomError(
          "Invalid File Saving",
          "File Not Saved Successfully",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }

    //@ts-ignore
    const user = await User.findById(userID);
    if (!user) {
      return next(
        new CustomError("Invalid User", "User Not Found", HttpStatus.NOT_FOUND)
      );
    }

    user.userImages?.push(imageDoc._id.toString());
    await user.save();

    //Simulation For Image Processing
    const processedIamgeiDir = path.join(__dirname, "../public/uploads/processed/");
    const processedImagePath = path.join(
      processedIamgeiDir,
      `${req.file.filename}`
    );
    await sharp(req.file.path).greyscale().toFile(processedImagePath);

    try {
      const result = await cloudinary.uploader.upload(processedImagePath); //Procesed Image File
      imageDoc.cloudURL = result.secure_url;
      await imageDoc.save();
      res.status(200).json({
        message: "File Uploaded Successfully",
        data: imageDoc,
        imageURL: result.secure_url,
      });
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return next(
        new CustomError(
          "Image Upload Failed",
          "Failed to upload the image to Cloudinary",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);
export const userController = {
  getAllUsers,
  register,
  login,
  logout,
  deleteUser,
  addUserInfo,
  updateUserInfo,
  uploadImage,
  getUserInfo
};
