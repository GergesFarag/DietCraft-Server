import { Request, Response, NextFunction } from "express";
import { catchError } from "../utils/catchError";
import cloudinary from "../config/cloudinary.config";
import axios from "axios";
const dotenv = require("dotenv");
dotenv.config();
const getImageFromCloud = async (imagePublicId: any) => {
  try {
    const url = cloudinary.url(imagePublicId, { format: "jpg", secure: true });
    // fetch the binary stream from Cloudinary
    const response = await axios.get(url, { responseType: "arraybuffer" });
    //@ts-ignore
    return response;
  } catch (error) {
    console.error("Error fetching image from Cloudinary:", error);
  }
};
export const modelController = {
  getImageFromCloud,
};
