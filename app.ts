import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv"; 
import { router as userRouter } from "./routes/user.router";
import {router as nutirentsRouter} from "./routes/nutients.router";
import { router as chatbotRouter } from "./routes/chatbot.router";
import ErrorsHandler  from "./utils/error.handler";
import cloudinary from "./config/cloudinary.config";
import axios from "axios";
export const app = express();
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests from this IP, please try again later."
}));
app.use(compression());
app.use(morgan(process.env.MODE as string === "development" ? "dev" : "combined"));
app.use('/public' ,express.static('public'));
app.use("/user", userRouter);
app.use("/nutrients", nutirentsRouter);
app.use("/chatbot" , chatbotRouter);
app.use(ErrorsHandler.errorHandle);
app.use("*",ErrorsHandler.notFound);