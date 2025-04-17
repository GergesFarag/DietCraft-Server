import mongoose from "mongoose";
export const imageSchema = new mongoose.Schema({
  userId: String,
  filename: String,
  mimetype: String,
  size: Number,
  cloudURL:String
});
export const Image = mongoose.model('image', imageSchema);