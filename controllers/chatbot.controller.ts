import { Request, Response, NextFunction } from "express";
import { catchError } from "../utils/catchError";
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});
const sendMessage = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { message } = req.body;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: message }],
        },
      ],
      max_tokens: 1000,
    });
    res.status(200).json({
      message: "Message Sent Successfully !",
      //@ts-ignore
      data: response.choices[0].message.content,
    });
  }
);
export const chatbotController = {
  sendMessage,
};
