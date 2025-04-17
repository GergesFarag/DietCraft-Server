import mongoose from "mongoose";
const connect = async () => {
    await mongoose.connect(process.env.MONGO_URI as string);
}
export const db = {
    connect
} 